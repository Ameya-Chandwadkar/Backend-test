import { User } from "../models/user.model.js";
import { Resume } from "../models/resume.model.js";
import { TECH_ROLES } from "../config/constants.js";

const registerUser = async (req, res) => {
    try {
        const { username, email, password, company } = req.body;

        // basic validation 

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are important!" })
        }

        // check if user exists already

        const existing = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });
        if (existing) {
            return res.status(400).json({ message: "User with this email or username already exists!" });
        }

        // create user

        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password,
            company: company || ""
        });

        res.status(201).json({
            message: "Hirer registered!",
            user: { id: user._id, email: user.email, username: user.username, company: user.company }
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {

        // checking if the user already exists
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) return res.status(400).json({
            message: "User not found"
        });


        // compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({
            message: "Invalid credentials"

        })

        const token = user.generateAuthToken();

        res.status(200).json({
            message: "Hirer Logged in",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                company: user.company,
                hiringRoles: user.hiringRoles
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const logoutuser = async (req, res) => {
    try {
        // JWT is stateless — client discards the token
        res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error", error
        });
    }
}

const getDashboard = async (req, res) => {
    try {
        // Only count resumes targeted at this hirer
        const hirerId = req.user._id;
        const totalResumes = await Resume.countDocuments({ targetHirer: hirerId });
        const pendingResumes = await Resume.countDocuments({ targetHirer: hirerId, status: "pending" });
        const processingResumes = await Resume.countDocuments({ targetHirer: hirerId, status: "processing" });
        const summarizedResumes = await Resume.countDocuments({ targetHirer: hirerId, status: "summarized" });
        const failedResumes = await Resume.countDocuments({ targetHirer: hirerId, status: "failed" });

        res.status(200).json({
            message: "Welcome to your dashboard!",
            user: {
                id: req.user._id,
                email: req.user.email,
                username: req.user.username,
                company: req.user.company,
                hiringRoles: req.user.hiringRoles
            },
            stats: {
                total: totalResumes,
                pending: pendingResumes,
                processing: processingResumes,
                summarized: summarizedResumes,
                failed: failedResumes
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Update the hirer's active hiring roles
const updateHiringRoles = async (req, res) => {
    try {
        const { roles } = req.body;

        if (!Array.isArray(roles)) {
            return res.status(400).json({ message: "roles must be an array of strings." });
        }

        // Validate each role against the predefined list
        const invalidRoles = roles.filter(r => !TECH_ROLES.includes(r));
        if (invalidRoles.length > 0) {
            return res.status(400).json({ message: `Invalid roles: ${invalidRoles.join(", ")}` });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { hiringRoles: roles },
            { new: true }
        ).select("-password");

        res.status(200).json({
            message: "Hiring roles updated!",
            hiringRoles: user.hiringRoles
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Public — list all hirers with their open roles (for upload page dropdown)
const getHirersList = async (req, res) => {
    try {
        const hirers = await User.find()
            .select("_id username company hiringRoles")
            .sort({ username: 1 });

        res.status(200).json({
            hirers: hirers.map(h => ({
                id: h._id,
                username: h.username,
                company: h.company,
                hiringRoles: h.hiringRoles
            }))
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Public — return the predefined tech roles list
const getTechRoles = (req, res) => {
    res.status(200).json({ roles: TECH_ROLES });
};

// Protected — update hirer profile (username, company)
const updateProfile = async (req, res) => {
    try {
        const { username, company } = req.body;
        const updates = {};

        if (username && username.trim()) {
            // Check if username is already taken by another user
            const existing = await User.findOne({
                username: username.toLowerCase(),
                _id: { $ne: req.user._id }
            });
            if (existing) {
                return res.status(400).json({ message: "Username already taken." });
            }
            updates.username = username.trim().toLowerCase();
        }

        if (company !== undefined) {
            updates.company = company.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update." });
        }

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");

        res.status(200).json({
            message: "Profile updated!",
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                company: user.company,
                hiringRoles: user.hiringRoles
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Protected - Get Analytics for Hirer
const getAnalytics = async (req, res) => {
    try {
        const hirerId = req.user._id;
        const resumes = await Resume.find({ targetHirer: hirerId });

        const totalResumes = resumes.length;
        const pending = resumes.filter(r => r.status === "pending" || r.status === "processing").length;
        const summarized = resumes.filter(r => r.status === "summarized").length;
        const failed = resumes.filter(r => r.status === "failed").length;
        
        let shortlisted = 0;
        const applicantsPerRole = {};
        const skillCounts = {};

        resumes.forEach(r => {
            // Applicants per role
            const role = r.targetRole || "General";
            applicantsPerRole[role] = (applicantsPerRole[role] || 0) + 1;

            // Shortlist (Manual flag)
            if (r.isShortlisted) {
                shortlisted++;
            }

            // Skills distribution
            if (r.summary) {
                const skillsStr = r.summary.matchedSkills || r.summary.skills;
                if (skillsStr && typeof skillsStr === "string") {
                    const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(s => s);
                    skillsArray.forEach(skill => {
                        const normalized = skill.toLowerCase();
                        skillCounts[normalized] = {
                            name: skill, // Keep original case for display
                            count: (skillCounts[normalized]?.count || 0) + 1
                        };
                    });
                }
            }
        });

        const topSkills = Object.values(skillCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const shortlistRate = summarized > 0 ? ((shortlisted / summarized) * 100).toFixed(1) : 0;

        res.status(200).json({
            funnel: { total: totalResumes, pending, summarized, shortlisted, failed },
            shortlistRate,
            applicantsPerRole,
            topSkills
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export {
    registerUser,
    loginUser,
    logoutuser,
    getDashboard,
    updateHiringRoles,
    getHirersList,
    getTechRoles,
    updateProfile,
    getAnalytics
};