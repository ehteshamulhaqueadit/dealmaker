import React, { useState, useEffect, useRef } from "react";
import { sendMessage, getMessagesByDeal, deleteMessage } from "../api/messages";
import { getUserProfile } from "../api/userData";
import { motion, AnimatePresence } from "framer-motion";

const Message = ({ dealId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userProfile = await getUserProfile();
        setCurrentUser(userProfile);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setError("Failed to load user information");
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch messages for the deal
  useEffect(() => {
    const fetchMessages = async () => {
      if (!dealId) return;

      try {
        setIsLoading(true);
        const fetchedMessages = await getMessagesByDeal(dealId);
        setMessages(fetchedMessages);
        setError("");
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setError("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [dealId]);

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    try {
      setIsLoading(true);
      const sentMessage = await sendMessage(dealId, newMessage.trim());
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      setError("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      setError("");
    } catch (error) {
      console.error("Failed to delete message:", error);
      setError("Failed to delete message");
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!dealId) {
    return (
      <div className="mt-6 border-t pt-6">
        <h2 className="text-2xl font-semibold mb-4">Messages</h2>
        <p className="text-gray-500">No deal selected for messaging.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-6">
      <h2 className="text-2xl font-semibold mb-4">Deal Messages</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div className="bg-gray-50 rounded-lg border h-96 flex flex-col">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && messages.length === 0 ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => {
                const isOwnMessage =
                  currentUser && message.senderId === currentUser.id;
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-800 border"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div
                            className={`text-xs ${
                              isOwnMessage ? "text-blue-100" : "text-gray-500"
                            } mb-1`}
                          >
                            {isOwnMessage
                              ? "You"
                              : message.sender?.full_name ||
                                message.senderUsername}
                          </div>
                          <p className="text-sm break-words">
                            {message.content}
                          </p>
                          <div
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {formatTimestamp(message.createdAt)}
                          </div>
                        </div>
                        {isOwnMessage && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="ml-2 text-blue-100 hover:text-white text-xs"
                            title="Delete message"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Message;
