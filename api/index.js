import dotenv from "dotenv";
import connectdb from "../src/config/database.js";
import app from "../src/app.js";

dotenv.config();

// Connect to DB once when the serverless function boots up
let isConnected = false;

export default async function handler(req, res) {
    if (!isConnected) {
        await connectdb();
        isConnected = true;
    }
    
    // Pass the request to the Express app
    return app(req, res);
}
