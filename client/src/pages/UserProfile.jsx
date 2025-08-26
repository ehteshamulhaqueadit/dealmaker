import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../api/userData";
import "./UserProfile.css"; // Import CSS for modern styling

const UserProfile = () => {
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        console.log("Fetched profile data:", data); // Debugging: Log the fetched data
        setProfile(data);
        setFormData({
          ...data,
          date_of_birth: data.profile?.date_of_birth || "",
          address: data.profile?.address || "",
          occupation: data.profile?.occupation || "",
        });
        console.log("Initialized formData:", {
          ...data,
          date_of_birth: data.profile?.date_of_birth || "",
          address: data.profile?.address || "",
          occupation: data.profile?.occupation || "",
        }); // Debugging: Log the initialized formData
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

  // Updated handleSubmit to send the correct JSON structure
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
      const updatedProfile = await getUserProfile(); // Fetch the updated profile data
      setProfile(updatedProfile); // Update the profile state with the latest data
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
    <div className="user-profile-container">
      <h1 className="user-profile-title">User Profile</h1>
      {message && <p className="user-profile-message">{message}</p>}
      {!isEditing ? (
        <div className="user-profile-view">
          <p>
            <strong>Username:</strong> {profile.username}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Full Name:</strong> {profile.full_name}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {profile.profile?.date_of_birth || "Not provided"}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {profile.profile?.address || "Not provided"}
          </p>
          <p>
            <strong>Occupation:</strong>{" "}
            {profile.profile?.occupation || "Not provided"}
          </p>
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form className="user-profile-form" onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              disabled // Prevent updates to username
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              onChange={handleChange}
              disabled // Prevent updates to email
            />
          </label>
          <label>
            Full Name:
            <input
              type="text"
              name="full_name"
              value={formData.full_name || ""}
              onChange={handleChange}
            />
          </label>
          <label>
            Date of Birth:
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth || ""}
              onChange={handleChange}
            />
          </label>
          <label>
            Address:
            <input
              type="text"
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
            />
          </label>
          <label>
            Occupation:
            <input
              type="text"
              name="occupation"
              value={formData.occupation || ""}
              onChange={handleChange}
            />
          </label>
          <button className="save-button" type="submit">
            Save
          </button>
          <button
            className="cancel-button"
            type="button"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default UserProfile;
