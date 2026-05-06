import dotenv from "dotenv";
dotenv.config();
import { uploadBufferToCloudinary } from "./src/config/cloudinary.js";
import fs from "fs";

async function run() {
    try {
        const buf = Buffer.from("test");
        const res = await uploadBufferToCloudinary(buf, "test_file");
        console.log("Cloudinary OK:", res.secure_url);
    } catch (e) {
        console.error("Cloudinary Error:", e.message || e);
    }
}
run();
