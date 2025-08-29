import React, { useState, useEffect } from "react";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Request a Dealmaker</h2>
          <button onClick={onClose} className="text-black font-bold">
            &times;
          </button>
        </div>

        <div className="flex-grow flex gap-4 overflow-hidden">
          {/* Left Side: Search and Send */}
          <div className="w-1/2 flex flex-col border-r pr-4">
            <h3 className="text-xl font-semibold mb-2">Search for Users</h3>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter username or name"
                className="border p-2 rounded w-full"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                Search
              </button>
            </form>
            <div className="overflow-y-auto">
              {searchResults.map((user) => {
                const isRequestSent = sentRequests.some(
                  (req) => req.receiverUsername === user.username
                );
                return (
                  <div
                    key={user.username}
                    className="border p-3 rounded mb-2 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">{user.username}</p>
                      <p>{user.full_name}</p>
                    </div>
                    <button
                      onClick={() =>
                        !isRequestSent && openMessageModal(user.username)
                      }
                      className={`text-white p-2 rounded ${
                        isRequestSent
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500"
                      }`}
                      disabled={isRequestSent}
                    >
                      {isRequestSent ? "Request Sent" : "Send Request"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Sent Requests */}
          <div className="w-1/2 flex flex-col">
            <h3 className="text-xl font-semibold mb-2">Sent Requests</h3>
            <div className="overflow-y-auto">
              {sentRequests.length > 0 ? (
                sentRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`border p-3 rounded mb-2 ${
                      request.rejected ? "bg-red-100" : ""
                    }`}
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
                      <p className="text-red-600 font-bold mt-2">
                        Status: Rejected
                      </p>
                    )}
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="bg-red-500 text-white p-2 rounded"
                        disabled={request.rejected}
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No requests sent for this deal yet.</p>
              )}
            </div>
          </div>
        </div>
        {isMessageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                Send Request to {selectedUser}
              </h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border p-2 rounded w-full h-32 mb-4"
                placeholder="Your message..."
              ></textarea>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsMessageModalOpen(false)}
                  className="bg-gray-300 p-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRequest}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>
        )}
        {notification.isOpen && (
          <div
            className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${
              notification.isError ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDealmakerModal;
