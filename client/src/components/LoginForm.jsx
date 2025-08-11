import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "../api/auth";
import PasswordResetDialog from "./PasswordResetDialog";
import Cookies from "js-cookie"; // Import js-cookie

function LoginForm({ onSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const forgotPasswordRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Perform the login API request
      const response = await login(form);
      console.log("Login response:", response);
      // If successful, store the token in a cookie
      Cookies.set("auth_token", response.token, {
        expires: 7,
        secure: true,
      }); // Cookie will expire in 7 days

      // Call onSuccess to close the modal
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-500 mt-1">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>
          <button
            type="button"
            ref={forgotPasswordRef}
            onClick={() => setShowResetDialog(!showResetDialog)}
            className="text-sm text-indigo-600 hover:text-indigo-500 focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className={`w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </motion.button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {showResetDialog && (
          <PasswordResetDialog
            onClose={() => setShowResetDialog(false)}
            anchorRef={forgotPasswordRef}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LoginForm;
