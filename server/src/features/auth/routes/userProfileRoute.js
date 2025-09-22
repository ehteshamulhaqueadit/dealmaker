import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
} from "../controllers/userProfileController.js";
import { authentication } from "../../../middleware/authMiddleware.js";

const userProfileRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/profile-pictures";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueName = `${req.user.username}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

userProfileRouter.use(authentication); // Apply authentication middleware to all routes in this router

userProfileRouter.get("/", getUserProfile);
userProfileRouter.post("/", updateUserProfile);
userProfileRouter.post(
  "/upload-picture",
  upload.single("profilePicture"),
  uploadProfilePicture
);
userProfileRouter.delete("/profile-picture", deleteProfilePicture);

export default userProfileRouter;
