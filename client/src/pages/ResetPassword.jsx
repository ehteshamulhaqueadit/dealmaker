import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { resetPassword } from "../api/auth";

const ResetPassword = () => {
  const { username, token } = useParams(); // Extract username and token from URL
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(username, token, password);
      setMessage("Password has been changed successfully! Please log in.");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setMessage(error.response.data.message); // Display the error message from the backend
      } else {
        console.error("Failed to reset password", error);
        setMessage("Failed to reset password. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 min-h-screen flex flex-col justify-center">
      <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
      {message && <p className="text-center text-red-500 mb-4">{message}</p>}
      <form
        className="bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            New Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">
            Confirm Password:
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Reset Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
