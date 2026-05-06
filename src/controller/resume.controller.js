import { Resume } from "../models/resume.model.js";
import { summarizeResume } from "../services/gemini.service.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

// Public — anyone can upload a resume (no auth)
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded. Please upload a PDF." });
        }

        const { uploaderName, uploaderEmail, targetHirer, targetRole } = req.body;

        if (!uploaderName || !uploaderEmail) {
            return res.status(400).json({ message: "Name and email are required." });
        }

        // Upload to Cloudinary
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cloudinaryResult = await uploadBufferToCloudinary(
            req.file.buffer, 
            uniqueSuffix + "_" + req.file.originalname
        );

        // Create resume record with pending status
        const resume = await Resume.create({
            uploaderName,
            uploaderEmail: uploaderEmail.toLowerCase(),
            fileName: req.file.originalname,
            filePath: "cloudinary",
            fileUrl: cloudinaryResult.secure_url,
            targetHirer: targetHirer || null,
            targetRole: targetRole || "",
            status: "pending"
        });

        // VERCEL REQUIRED: Await the summary processing before sending response
        await processResumeSummary(resume._id, req.file.buffer, targetRole || "", req.file.originalname);

        const updatedResume = await Resume.findById(resume._id);

        res.status(201).json({
            message: "Resume uploaded and processed successfully",
            resume: updatedResume
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Function to extract text and run AI summarization
const processResumeSummary = async (resumeId, fileBuffer, targetRole, fileName = "") => {
    try {
        // Mark as processing
        await Resume.findByIdAndUpdate(resumeId, { status: "processing" });

        // Extract text from PDF buffer directly
        const parser = new PDFParse({ data: fileBuffer });
        const result = await parser.getText();
        // getText returns an object with pages array containing text
        let extractedText = "";
        if (typeof result === "string") {
            extractedText = result;
        } else if (result && result.pages) {
            extractedText = result.pages.map(p => p.text || p).join("\n");
        } else if (result && result.text) {
            extractedText = result.text;
        } else {
            extractedText = String(result);
        }

        if (!extractedText || extractedText.trim().length < 50) {
            await Resume.findByIdAndUpdate(resumeId, {
                status: "failed",
                rawText: extractedText || "",
                summary: {
                    overview: "Could not extract sufficient text from this PDF. The file may be image-based or corrupted.",
                    education: "", experience: "", skills: "", achievements: "", roleFit: "", rating: null
                }
            });
            return;
        }

        // Run AI summarization with role context
        const summary = await summarizeResume(extractedText, targetRole, fileName);

        // Update resume with summary
        await Resume.findByIdAndUpdate(resumeId, {
            status: "summarized",
            rawText: extractedText,
            summary
        });

        console.log(`Resume ${resumeId} summarized successfully`);

    } catch (error) {
        console.error(`Failed to summarize resume ${resumeId}:`, error.message);
        await Resume.findByIdAndUpdate(resumeId, {
            status: "failed",
            summary: {
                overview: "AI summarization failed. Error: " + error.message,
                education: "", experience: "", skills: "", achievements: "", roleFit: "", rating: null
            }
        });
    }
};

// Protected — hirer gets only resumes targeted at them
const getAllResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ targetHirer: req.user._id })
            .select("-rawText") // Exclude raw text for list view
            .sort({ "summary.matchPercentage": -1, createdAt: -1 });

        res.status(200).json({
            message: "Resumes fetched successfully",
            count: resumes.length,
            resumes
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Protected — hirer gets a single resume by ID
const getResumeById = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        res.status(200).json({ resume });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Protected — hirer deletes a resume
const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }

        // We skip Cloudinary deletion for simplicity, but we delete the DB record
        await Resume.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Resume deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Protected - Toggle Shortlist Status
const toggleShortlist = async (req, res) => {
    try {
        const resumeId = req.params.id;
        const resume = await Resume.findOne({ _id: resumeId, targetHirer: req.user._id });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found or unauthorized." });
        }

        resume.isShortlisted = !resume.isShortlisted;
        await resume.save();

        res.status(200).json({
            message: resume.isShortlisted ? "Candidate shortlisted!" : "Removed from shortlist.",
            isShortlisted: resume.isShortlisted
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export {
    uploadResume,
    getAllResumes,
    getResumeById,
    toggleShortlist,
    deleteResume
};
