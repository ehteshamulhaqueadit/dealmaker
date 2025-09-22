import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  searchUsers,
  sendDealmakerRequest,
  getSentRequests,
  cancelDealmakerRequest,
} from "../api/requestDealmaker";

const RequestDealmakerModal = ({ dealId, onClose }) => {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [message, setMessage] = useState(
    "I would like to request you to be a dealmaker for my deal."
  );
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    isError: false,
  });

  const fetchSentRequests = async () => {
    try {
      const requests = await getSentRequests(dealId);
      setSentRequests(requests);
    } catch (error) {
      console.error("Error fetching sent requests:", error);
    }
  };

  const fetchUsers = async (currentKeyword = "") => {
    try {
      const users = await searchUsers(currentKeyword, dealId);
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  useEffect(() => {
    fetchSentRequests();
    fetchUsers(); // Fetch all users on initial load
  }, [dealId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchUsers(keyword);
  };

  const handleSendRequest = async () => {
    if (!selectedUser) return;
    try {
      await sendDealmakerRequest(dealId, selectedUser, message);
      showNotification("Request sent successfully!");
      fetchSentRequests(); // Refresh the list of sent requests
      setIsMessageModalOpen(false); // Close the message modal
      setSelectedUser(null); // Reset selected user
    } catch (error) {
      console.error("Error sending request:", error);
      showNotification(
        error.response?.data?.message || "Failed to send request",
        true
      );
    }
  };

  const openMessageModal = (username) => {
    setSelectedUser(username);
    setIsMessageModalOpen(true);
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelDealmakerRequest(requestId);
      showNotification("Request canceled successfully!");
      fetchSentRequests(); // Refresh the list
    } catch (error) {
      console.error("Error canceling request:", error);
      showNotification("Failed to cancel request", true);
    }
  };

  const showNotification = (message, isError = false) => {
    setNotification({ isOpen: true, message, isError });
    setTimeout(() => {
      setNotification({ isOpen: false, message: "", isError: false });
    }, 3000); // Auto-close after 3 seconds
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <motion.h2
              className="text-2xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Request a Dealmaker
            </motion.h2>
            <motion.button
              onClick={onClose}
              className="text-black font-bold text-2xl hover:text-gray-600 transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              &times;
            </motion.button>
          </div>

          <motion.div
            className="flex-grow flex gap-4 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Left Side: Search and Send */}
            <motion.div
              className="w-1/2 flex flex-col border-r pr-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <motion.h3
                className="text-xl font-semibold mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Search for Users
              </motion.h3>
              <motion.form
                onSubmit={handleSearch}
                className="flex gap-2 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Enter username or name"
                  className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <motion.button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search
                </motion.button>
              </motion.form>
              <motion.div
                className="overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                {searchResults.map((user, index) => {
                  const isRequestSent = sentRequests.some(
                    (req) => req.receiverUsername === user.username
                  );
                  return (
                    <motion.div
                      key={user.username}
                      className="border p-3 rounded mb-2 flex justify-between items-center hover:shadow-md transition-shadow duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div>
                        <p className="font-bold">{user.username}</p>
                        <p className="text-gray-600">{user.full_name}</p>
                      </div>
                      <motion.button
                        onClick={() =>
                          !isRequestSent && openMessageModal(user.username)
                        }
                        className={`text-white p-2 rounded transition-colors duration-200 ${
                          isRequestSent
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                        disabled={isRequestSent}
                        whileHover={!isRequestSent ? { scale: 1.05 } : {}}
                        whileTap={!isRequestSent ? { scale: 0.95 } : {}}
                      >
                        {isRequestSent ? "Request Sent" : "Send Request"}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Right Side: Sent Requests */}
            <motion.div
              className="w-1/2 flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <motion.h3
                className="text-xl font-semibold mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Sent Requests
              </motion.h3>
              <motion.div
                className="overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                {sentRequests.length > 0 ? (
                  sentRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      className={`border p-3 rounded mb-2 transition-all duration-200 hover:shadow-md ${
                        request.rejected
                          ? "bg-red-50 border-red-200"
                          : "hover:bg-gray-50"
                      }`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <p>
                        <span className="font-bold">To:</span>{" "}
                        {request.receiverUsername}
                      </p>
                      <p>
                        <span className="font-bold">From:</span>{" "}
                        {request.senderUsername}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.message}
                      </p>
                      {request.rejected && (
                        <motion.p
                          className="text-red-600 font-bold mt-2"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          Status: Rejected
                        </motion.p>
                      )}
                      <div className="flex justify-end mt-2">
                        <motion.button
                          onClick={() => handleCancelRequest(request.id)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors duration-200"
                          disabled={request.rejected}
                          whileHover={!request.rejected ? { scale: 1.05 } : {}}
                          whileTap={!request.rejected ? { scale: 0.95 } : {}}
                        >
                          Cancel Request
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    className="text-gray-500 text-center py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                  >
                    No requests sent for this deal yet.
                  </motion.p>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
          {isMessageModalOpen && (
            <AnimatePresence>
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2, type: "spring" }}
                >
                  <motion.h3
                    className="text-xl font-semibold mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Send Request to {selectedUser}
                  </motion.h3>
                  <motion.textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border p-2 rounded w-full h-32 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Your message..."
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  ></motion.textarea>
                  <motion.div
                    className="flex justify-end gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      onClick={() => setIsMessageModalOpen(false)}
                      className="bg-gray-300 p-2 rounded hover:bg-gray-400 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSendRequest}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Confirm & Send
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
          <AnimatePresence>
            {notification.isOpen && (
              <motion.div
                className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 ${
                  notification.isError ? "bg-red-500" : "bg-green-500"
                }`}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RequestDealmakerModal;
