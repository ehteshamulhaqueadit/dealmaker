import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMail, FiSend } from "react-icons/fi";
import { requestPasswordReset } from "../api/auth";

function PasswordResetDialog({ onClose, anchorRef }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email);

      if (response.success) {
        setMessage({
          text:
            response.message ||
            "Password reset link has been sent to your email.",
          type: "success",
        });
      } else {
        setMessage({
          text:
            response.message || "Failed to send reset link. Please try again.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setMessage({
        text:
          err.response?.data?.message ||
          "An unexpected error occurred. Please try again later.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6 relative">
            <button
              onClick={onClose}
              aria-label="Exit dialog"
              className="absolute top-4 right-4 px-4 py-2 text-sm font-semibold rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Dismiss
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-4">
                <FiMail
                  size={28}
                  className="text-blue-600 dark:text-blue-300"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Reset Password
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 text-center">
                Enter your email to receive a password reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <FiMail className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white shadow-md`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend /> Send Reset Link
                  </>
                )}
              </button>
            </form>

            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default PasswordResetDialog;
