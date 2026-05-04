import { User } from "../models/user.model.js";

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

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
        });

        res.status(201).json({
            message: "User registered!",
            user: { id: user._id, email: user.email, username: user.username }
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
            message: "User Logged in",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
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
        const { email } = req.body;

        const user = await User.findOne({
            email
        });

        if (!user) return res.status(404).json({
            message: "User not found"
        });

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
        // req.user is set by the auth middleware
        res.status(200).json({
            message: "Welcome to your dashboard! Login was successful.",
            user: {
                id: req.user._id,
                email: req.user.email,
                username: req.user.username,
                avatar: req.user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const uploadGuestFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Return the public URL
        const fileUrl = `${req.protocol}://${req.get('host')}/public/uploads/guest/${req.file.filename}`;

        res.status(200).json({
            message: "Guest file uploaded successfully",
            fileUrl
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Return the public URL
        const fileUrl = `${req.protocol}://${req.get('host')}/public/uploads/users/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: fileUrl },
            { new: true }
        );

        res.status(200).json({
            message: "Avatar updated successfully",
            avatar: user.avatar
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
    uploadGuestFile,
    updateAvatar
};