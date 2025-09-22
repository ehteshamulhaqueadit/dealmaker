import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getProgress,
  createProgress,
  updateProgressStatus,
} from "../api/progress";
import { getUserProfile } from "../api/userData";

const ProgressModal = ({ isOpen, onClose, dealId, deal }) => {
  const [progressItems, setProgressItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProgress, setNewProgress] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
      fetchProgress();
    }
  }, [isOpen, dealId]);

  const fetchCurrentUser = async () => {
    try {
      const userData = await getUserProfile();
      setCurrentUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchProgress = async () => {
    if (!dealId) return;

    setLoading(true);
    try {
      const progressData = await getProgress(dealId);
      setProgressItems(progressData);
    } catch (error) {
      setError("Failed to fetch progress");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgress = async (e) => {
    e.preventDefault();

    if (!newProgress.title) {
      setError("Title is required");
      return;
    }

    try {
      const createdProgress = await createProgress(
        dealId,
        newProgress.title,
        newProgress.description
      );

      setProgressItems((prev) => [...prev, createdProgress]);
      setNewProgress({ title: "", description: "" });
      setShowCreateForm(false);
      setSuccess("Progress item created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to create progress item");
      console.error("Error:", error);
    }
  };

  const handleUpdateStatus = async (progressId, status) => {
    try {
      const updatedProgress = await updateProgressStatus(progressId, status);

      setProgressItems((prev) =>
        prev.map((item) => (item.id === progressId ? updatedProgress : item))
      );

      setSuccess(`Progress updated to ${status}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to update progress status");
      console.error("Error:", error);
    }
  };

  const canManageProgress =
    currentUser && deal && deal.dealmaker === currentUser.username;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-gray-600 bg-gray-100";
      case "in_progress":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "in_progress":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      case "completed":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Deal Progress Tracking
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Status Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            {/* Create Progress Button */}
            {canManageProgress && (
              <div className="mb-6">
                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Progress Item
                  </button>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">
                      Create Progress Item
                    </h3>
                    <form onSubmit={handleCreateProgress}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={newProgress.title}
                          onChange={(e) =>
                            setNewProgress((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Progress milestone title"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newProgress.description}
                          onChange={(e) =>
                            setNewProgress((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Detailed description of this milestone"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Create Progress Item
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewProgress({ title: "", description: "" });
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Progress List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading progress...</p>
              </div>
            ) : progressItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">
                  No progress items found for this deal.
                </p>
                {canManageProgress && (
                  <p className="text-sm text-gray-400 mt-2">
                    Click "Add Progress Item" to start tracking progress.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {progressItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {getStatusIcon(item.status)}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-gray-600 mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Step {index + 1}</span>
                            <span>Created {formatDate(item.createdAt)}</span>
                            {item.completedAt && (
                              <span>
                                Completed {formatDate(item.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {item.status === "completed" && item.completedByUser && (
                      <div className="bg-green-50 p-3 rounded-lg mb-3">
                        <p className="text-green-700 text-sm">
                          ✅ Completed by{" "}
                          {item.completedByUser.full_name ||
                            item.completedByUsername}
                        </p>
                      </div>
                    )}

                    {canManageProgress && item.status !== "completed" && (
                      <div className="flex gap-2 mt-3">
                        {item.status === "pending" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(item.id, "in_progress")
                            }
                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                          >
                            Start Progress
                          </button>
                        )}
                        {item.status === "in_progress" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateStatus(item.id, "completed")
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(item.id, "pending")
                              }
                              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                            >
                              Reset to Pending
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProgressModal;
