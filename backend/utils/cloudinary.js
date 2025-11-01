// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: "./src/.env" });

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Function to upload file to Cloudinary
export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("✅ File uploaded to Cloudinary:", response.secure_url);

    // Delete local file after upload
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

    return response;
  } catch (err) {
    console.error("❌ Cloudinary Upload Error:", err.message);

    // Cleanup local file if upload fails
    if (localFilePath && fs.existsSync(localFilePath))
      fs.unlinkSync(localFilePath);

    return null;
  }
};
