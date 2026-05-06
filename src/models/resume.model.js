import mongoose, { Schema } from "mongoose";

const resumeSchema = new Schema(
    {
        uploaderName: {
            type: String,
            required: true,
            trim: true
        },

        uploaderEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },

        fileName: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        fileUrl: {
            type: String,
            required: true
        },

        targetHirer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        targetRole: {
            type: String,
            trim: true,
            default: ""
        },

        status: {
            type: String,
            enum: ["pending", "processing", "summarized", "failed"],
            default: "pending"
        },

        summary: {
            // General Insights
            overview: { type: String, default: "" },
            education: { type: String, default: "" },
            experience: { type: String, default: "" },
            skills: { type: String, default: "" },
            achievements: { type: String, default: "" },
            strengths: { type: String, default: "" },
            weaknesses: { type: String, default: "" },
            missingSkills: { type: String, default: "" },
            experienceLevel: { type: String, default: "" },
            projectQuality: { type: String, default: "" },
            communicationScore: { type: Number, min: 1, max: 10, default: null },
            
            // Job Match Details
            roleFit: { type: String, default: "" },
            matchPercentage: { type: Number, min: 0, max: 100, default: null },
            matchedSkills: { type: String, default: "" },
            missingJobSkills: { type: String, default: "" },
            relevantProjects: { type: String, default: "" },
            experienceOverlap: { type: String, default: "" },
            
            // Interview
            interviewQuestions: {
                technical: { type: String, default: "" },
                hr: { type: String, default: "" }
            },
            
            // Meta
            aiFlag: { type: String, default: "" },
            rating: { type: Number, min: 1, max: 10, default: null }
        },

        rawText: {
            type: String,
            default: ""
        },

        isShortlisted: {
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true
    }
);

export const Resume = mongoose.model("Resume", resumeSchema);
