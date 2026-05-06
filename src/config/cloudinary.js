import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

// Setup connection using environment variables
// Ensure CLOUDINARY_URL is in .env
// e.g. CLOUDINARY_URL=cloudinary://my_key:my_secret@my_cloud_name
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Helper function to upload buffer
export const uploadBufferToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        let cld_upload_stream = cloudinary.uploader.upload_stream(
            {
                folder: "resumes",
                resource_type: "raw", // important for PDFs
                public_id: filename
            },
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(cld_upload_stream);
    });
};

export { cloudinary };
