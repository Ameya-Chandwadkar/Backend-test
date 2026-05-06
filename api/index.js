import dotenv from "dotenv";
dotenv.config();

import connectdb from "../src/config/database.js";
import app from "../src/app.js";

// Connect to DB once when the serverless function boots up
let isConnected = false;

export default async function handler(req, res) {
    try {
        if (!isConnected) {
            console.log("Connecting to MongoDB...");
            console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
            await connectdb();
            isConnected = true;
            console.log("MongoDB connected successfully!");
        }

        // Pass the request to the Express app
        return app(req, res);
    } catch (error) {
        console.error("Handler crash:", error.message);
        console.error("Full error:", error);
        res.status(500).json({ 
            error: "Server startup failed", 
            message: error.message 
        });
    }
}
