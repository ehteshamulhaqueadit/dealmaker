import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FiCamera, FiTrash2, FiUpload, FiUser } from "react-icons/fi";
import { uploadProfilePicture, deleteProfilePicture } from "../api/userData";

const ProfilePictureUpload = ({
  currentPicture,
  onPictureUpdate,
  username,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    try {
      const response = await uploadProfilePicture(file);
      if (response.success) {
        onPictureUpdate(response.profilePictureUrl);
        setPreview(null);
      } else {
        alert("Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      setIsUploading(true);
      try {
        const response = await deleteProfilePicture();
        if (response.success) {
          onPictureUpdate(null);
        } else {
          alert("Failed to delete profile picture");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete profile picture");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getDisplayImage = () => {
    if (preview) return preview;
    if (currentPicture) {
      // If currentPicture starts with 'http' it's already a full URL
      if (currentPicture.startsWith("http")) {
        return currentPicture;
      }
      // Otherwise, construct the full URL with the server address
      return `http://localhost:8000${currentPicture}`;
    }
    return null;
  };

  const displayImage = getDisplayImage();

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-4 border-indigo-200 overflow-hidden bg-gray-100 flex items-center justify-center">
          {displayImage ? (
            <img
              src={displayImage}
              alt={`${username}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <FiUser className="w-16 h-16 text-gray-400" />
          )}
        </div>

        {/* Upload overlay */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={triggerFileInput}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiCamera className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={triggerFileInput}
          disabled={isUploading}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiUpload className="w-4 h-4" />
          <span>{currentPicture ? "Change" : "Upload"}</span>
        </motion.button>

        {currentPicture && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Remove</span>
          </motion.button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500 text-center max-w-xs">
        Supported formats: JPEG, PNG, GIF. Maximum size: 5MB
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
