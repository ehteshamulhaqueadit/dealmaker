import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getUserProfile, updateUserProfile } from "../api/userData.js";
import ProfilePictureUpload from "../components/ProfilePictureUpload.jsx";
import PasswordResetDialog from "../components/PasswordResetDialog.jsx";
import { FiEdit3, FiKey, FiSave, FiX } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext.jsx";

const Profile = () => {
  const { user, updateUserProfile: updateAuthUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setFormData({
          ...data,
          date_of_birth: data.profile?.date_of_birth || "",
          address: data.profile?.address || "",
          occupation: data.profile?.occupation || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureUpdate = (newPictureUrl) => {
    const updatedProfile = {
      ...profile,
      profile: {
        ...profile.profile,
        profile_picture: newPictureUrl,
      },
    };
    setProfile(updatedProfile);
    updateAuthUser(updatedProfile); // Update auth context
    setMessage("Profile picture updated successfully!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: formData.full_name,
        password_reset_token: formData.password_reset_token || null,
        date_of_birth: formData.date_of_birth || null, // Ensure null is sent for empty date
        address: formData.address,
        occupation: formData.occupation,
      };

      await updateUserProfile(payload);
      const updatedProfile = await getUserProfile();
      setProfile(updatedProfile);
      setFormData({
        ...updatedProfile,
        date_of_birth: updatedProfile.profile?.date_of_birth || "",
        address: updatedProfile.profile?.address || "",
        occupation: updatedProfile.profile?.occupation || "",
      });
      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage("Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
            My Profile
          </h1>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center"
            >
              {message}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  Profile Picture
                </h2>
                <ProfilePictureUpload
                  currentPicture={profile.profile?.profile_picture}
                  onPictureUpdate={handleProfilePictureUpdate}
                  username={profile.username}
                />

                {/* Reset Password Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowResetDialog(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <FiKey className="w-4 h-4" />
                    <span>Reset Password</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Profile Information Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Profile Information
                  </h2>
                  {!isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </motion.button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Username
                        </label>
                        <p className="text-gray-900 font-medium">
                          {profile.username}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 font-medium">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Full Name
                      </label>
                      <p className="text-gray-900 font-medium">
                        {profile.full_name || "Not provided"}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Date of Birth
                        </label>
                        <p className="text-gray-900 font-medium">
                          {profile.profile?.date_of_birth || "Not provided"}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Occupation
                        </label>
                        <p className="text-gray-900 font-medium">
                          {profile.profile?.occupation || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Address
                      </label>
                      <p className="text-gray-900 font-medium">
                        {profile.profile?.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username || ""}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Occupation
                        </label>
                        <input
                          type="text"
                          name="occupation"
                          value={formData.occupation || ""}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your occupation"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your address"
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                        <span>Cancel</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <FiSave className="w-4 h-4" />
                        <span>Save Changes</span>
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Password Reset Dialog */}
      {showResetDialog && (
        <PasswordResetDialog onClose={() => setShowResetDialog(false)} />
      )}
    </div>
  );
};

export default Profile;
