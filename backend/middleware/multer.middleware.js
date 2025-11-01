import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";

// Configure storage dynamically
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "public/Images/others"; // default folder

    if (file.fieldname === "avatar") {
      folder = "public/Images/profile";
    } else if (file.fieldname === "coverImage") {
      folder = "public/Images/coverImage";
    } else if (file.fieldname === "imageContent") {
      folder = "public/Images/posts/image";
    } else if (file.fieldname === "videoContent") {
      folder = "public/Images/posts/video";
    }

    // ✅ Ensure folder exists
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
  filename: function (req, file, cb) {
    // ✅ Generate unique hex name
    const uniqueName =
      crypto.randomBytes(12).toString("hex") + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
