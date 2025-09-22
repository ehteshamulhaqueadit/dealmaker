import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDisputes, createDispute, resolveDispute } from "../api/disputes";
import { getUserProfile } from "../api/userData";

const DisputeModal = ({ isOpen, onClose, dealId, deal }) => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDispute, setNewDispute] = useState({
    title: "",
    description: "",
  });
  const [resolutionForm, setResolutionForm] = useState({
    disputeId: null,
    resolution: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchCurrentUser();
      fetchDisputes();
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

  const fetchDisputes = async () => {
    if (!dealId) return;

    setLoading(true);
    try {
      const disputeData = await getDisputes(dealId);
      setDisputes(disputeData);
    } catch (error) {
      setError("Failed to fetch disputes");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();

    if (!newDispute.title || !newDispute.description) {
      setError("Title and description are required");
      return;
    }

    try {
      const createdDispute = await createDispute(
        dealId,
        newDispute.title,
        newDispute.description
      );

      setDisputes((prev) => [createdDispute, ...prev]);
      setNewDispute({ title: "", description: "" });
      setShowCreateForm(false);
      setSuccess("Dispute created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to create dispute");
      console.error("Error:", error);
    }
  };

  const handleResolveDispute = async (e) => {
    e.preventDefault();

    if (!resolutionForm.resolution) {
      setError("Resolution is required");
      return;
    }

    try {
      const resolvedDispute = await resolveDispute(
        resolutionForm.disputeId,
        resolutionForm.resolution
      );

      setDisputes((prev) =>
        prev.map((dispute) =>
          dispute.id === resolutionForm.disputeId ? resolvedDispute : dispute
        )
      );

      setResolutionForm({ disputeId: null, resolution: "" });
      setSuccess("Dispute resolved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to resolve dispute");
      console.error("Error:", error);
    }
  };

  const canCreateDispute =
    currentUser &&
    deal &&
    (deal.dealer_creator === currentUser.username ||
      deal.dealer_joined === currentUser.username);

  const canResolveDispute =
    currentUser && deal && deal.dealmaker === currentUser.username;

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "text-red-600 bg-red-100";
      case "resolved":
        return "text-green-600 bg-green-100";
      case "closed":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
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
                Deal Disputes
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

            {/* Create Dispute Button */}
            {canCreateDispute && (
              <div className="mb-6">
                {!showCreateForm ? (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Raise New Dispute
                  </button>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">
                      Create New Dispute
                    </h3>
                    <form onSubmit={handleCreateDispute}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={newDispute.title}
                          onChange={(e) =>
                            setNewDispute((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Brief title of the dispute"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newDispute.description}
                          onChange={(e) =>
                            setNewDispute((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Detailed description of the dispute"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Create Dispute
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewDispute({ title: "", description: "" });
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

            {/* Disputes List */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading disputes...</p>
              </div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No disputes found for this deal.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">
                          {dispute.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Raised by{" "}
                          {dispute.raiser?.full_name ||
                            dispute.raisedByUsername}{" "}
                          on {formatDate(dispute.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          dispute.status
                        )}`}
                      >
                        {dispute.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">{dispute.description}</p>

                    {dispute.status === "resolved" && dispute.resolution && (
                      <div className="bg-green-50 p-3 rounded-lg mb-3">
                        <h4 className="text-sm font-medium text-green-800 mb-1">
                          Resolution by{" "}
                          {dispute.resolver?.full_name ||
                            dispute.resolvedByUsername}
                          :
                        </h4>
                        <p className="text-green-700 text-sm">
                          {dispute.resolution}
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                          Resolved on {formatDate(dispute.resolvedAt)}
                        </p>
                      </div>
                    )}

                    {dispute.status === "open" && canResolveDispute && (
                      <div className="mt-3">
                        {resolutionForm.disputeId === dispute.id ? (
                          <form
                            onSubmit={handleResolveDispute}
                            className="bg-blue-50 p-3 rounded-lg"
                          >
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Resolution
                            </label>
                            <textarea
                              value={resolutionForm.resolution}
                              onChange={(e) =>
                                setResolutionForm((prev) => ({
                                  ...prev,
                                  resolution: e.target.value,
                                }))
                              }
                              rows={3}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Provide your resolution for this dispute"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                type="submit"
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                Resolve Dispute
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setResolutionForm({
                                    disputeId: null,
                                    resolution: "",
                                  })
                                }
                                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() =>
                              setResolutionForm({
                                disputeId: dispute.id,
                                resolution: "",
                              })
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Resolve Dispute
                          </button>
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

export default DisputeModal;
