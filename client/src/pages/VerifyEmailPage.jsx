// src/pages/VerifyEmailPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { confirmEmail } from "../api/auth";

export default function VerifyEmailPage() {
  const { key } = useParams();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log("Verifying email with key:", key);
        const data = await confirmEmail(key);
        console.log("Response from server:", data);

        setStatus("success");
        setMessage(
          data.message || "Your email has been verified successfully!"
        );
      } catch (err) {
        console.error("Email verification error:", err);
        setStatus("error");

        // Handle different error types
        if (err.response?.data?.message) {
          setMessage(err.response.data.message);
        } else if (err.message) {
          setMessage(err.message);
        } else {
          setMessage(
            "Verification failed. The link may be invalid or expired."
          );
        }
      }
    };

    if (key) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Invalid verification link - missing token.");
    }
  }, [key]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-6 text-center">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold mb-4">Verifying your email...</h1>
            <p className="text-gray-500">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-bold text-green-600 mb-4">Success!</h1>
            <p className="text-gray-700">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-700">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
