import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../api/userData";

const UserProfile = () => {
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        full_name: formData.full_name,
        password_reset_token: formData.password_reset_token || null,
        date_of_birth: formData.date_of_birth,
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
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">User Profile</h1>
      {message && <p className="text-center text-green-600 mb-4">{message}</p>}
      {!isEditing ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">
            <strong>Username:</strong> {profile.username}
          </p>
          <p className="mb-4">
            <strong>Email:</strong> {profile.email}
          </p>
          <p className="mb-4">
            <strong>Full Name:</strong> {profile.full_name}
          </p>
          <p className="mb-4">
            <strong>Date of Birth:</strong>{" "}
            {profile.profile?.date_of_birth || "Not provided"}
          </p>
          <p className="mb-4">
            <strong>Address:</strong>{" "}
            {profile.profile?.address || "Not provided"}
          </p>
          <p className="mb-4">
            <strong>Occupation:</strong>{" "}
            {profile.profile?.occupation || "Not provided"}
          </p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form
          className="bg-white p-6 rounded-lg shadow-md"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              disabled
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              disabled
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Full Name:
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name || ""}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Date of Birth:
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth || ""}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Address:
            </label>
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Occupation:
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation || ""}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="flex justify-end">
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              type="submit"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;
