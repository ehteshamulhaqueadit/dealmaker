import React, { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage, getMessagesByDeal } from "../api/messages";
import { getUserProfile } from "../api/userData";
import { motion, AnimatePresence } from "framer-motion";
import { useDealRealtime } from "../hooks/useSocket";

const Message = ({ dealId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const [otherUsersTyping, setOtherUsersTyping] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch current user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userProfile = await getUserProfile();
        console.log("Current user profile:", userProfile);
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

  // Real-time typing update handler
  const handleTypingUpdate = useCallback(
    (data) => {
      const { dealId: typingDealId, userInfo, isTyping } = data;
      console.log("Received typing update:", data);

      if (typingDealId === dealId && currentUser) {
        // Don't show typing indicator for current user
        if (userInfo.id !== currentUser.id) {
          console.log(
            `${userInfo.username} is ${isTyping ? "typing" : "stopped typing"}`
          );
          setOtherUsersTyping((prevTyping) => {
            if (isTyping) {
              // Add user to typing list if not already there
              const exists = prevTyping.find((user) => user.id === userInfo.id);
              if (!exists) {
                console.log("Adding user to typing list:", userInfo);
                return [...prevTyping, userInfo];
              }
              return prevTyping;
            } else {
              // Remove user from typing list
              console.log("Removing user from typing list:", userInfo);
              return prevTyping.filter((user) => user.id !== userInfo.id);
            }
          });
        }
      }
    },
    [dealId, currentUser]
  );

  // Real-time message update handler
  const handleMessageUpdate = useCallback(
    (data) => {
      const { dealId: messageDealId, messageData, updateType } = data;

      if (messageDealId === dealId) {
        console.log("Real-time message update:", updateType, messageData);

        if (updateType === "sent") {
          // Check if this is the current user's message to avoid duplicates
          const isCurrentUserMessage =
            currentUser &&
            ((messageData.sender && currentUser.id === messageData.sender.id) ||
              (messageData.senderId &&
                currentUser.id === messageData.senderId) ||
              (messageData.senderUsername &&
                currentUser.username === messageData.senderUsername));

          // Only add messages from other users via real-time updates
          // Current user's messages are handled in handleSendMessage
          if (!isCurrentUserMessage) {
            setMessages((prevMessages) => {
              const messageExists = prevMessages.find(
                (msg) => msg.id === messageData.id
              );
              if (!messageExists) {
                // Sort messages by creation time to maintain order
                const newMessages = [...prevMessages, messageData];
                return newMessages.sort(
                  (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
              }
              return prevMessages;
            });
          }
        }
      }
    },
    [dealId, currentUser]
  );

  // Set up real-time connection for this deal
  const socket = useDealRealtime(dealId, {
    onMessageUpdate: handleMessageUpdate,
    onTypingUpdate: handleTypingUpdate,
  });

  // Optimized send message handler for immediate UI feedback
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // Create temporary message for immediate UI feedback
    const tempMessage = {
      id: tempId,
      content: messageContent,
      createdAt: new Date().toISOString(),
      senderId: currentUser.id,
      sender: currentUser,
      senderUsername: currentUser.username,
      isTemporary: true,
    };

    try {
      // Stop typing indicator when sending message
      if (isUserTyping && socket) {
        setIsUserTyping(false);
        socket.stopTyping(dealId, {
          id: currentUser.id,
          username: currentUser.username,
          full_name: currentUser.full_name,
        });
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }

      // Add temporary message immediately for instant feedback
      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");
      setIsLoading(true);

      // Send message to server
      const sentMessage = await sendMessage(dealId, messageContent);

      // Replace temporary message with actual message from server
      setMessages((prev) => {
        const updatedMessages = prev.map((msg) =>
          msg.id === tempId ? { ...sentMessage, isTemporary: false } : msg
        );

        // If temp message wasn't found (edge case), just add the sent message
        const tempMessageFound = prev.some((msg) => msg.id === tempId);
        if (!tempMessageFound) {
          return [...prev, { ...sentMessage, isTemporary: false }];
        }

        return updatedMessages;
      });

      setError("");

      // Maintain focus in fullscreen mode to keep keyboard attached
      if (isFullscreen && inputRef.current) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 50);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setError("Failed to send message");

      // Remove temporary message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setNewMessage(messageContent); // Restore message content
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced timestamp formatting
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    // For older messages, show date
    const isThisYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(isThisYear ? {} : { year: "numeric" }),
    });
  };

  // Handle typing indicator
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Handle typing indicators
    if (currentUser && dealId && socket) {
      // Start typing if not already typing
      if (!isUserTyping) {
        console.log(
          "Starting typing indicator for user:",
          currentUser.username
        );
        setIsUserTyping(true);
        socket.startTyping(dealId, {
          id: currentUser.id,
          username: currentUser.username,
          full_name: currentUser.full_name,
        });
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        console.log(
          "Stopping typing indicator for user:",
          currentUser.username
        );
        setIsUserTyping(false);
        socket.stopTyping(dealId, {
          id: currentUser.id,
          username: currentUser.username,
          full_name: currentUser.full_name,
        });
      }, 3000);
    }
  };

  // Stop typing when user sends message or component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isUserTyping && currentUser && dealId && socket) {
        socket.stopTyping(dealId, {
          id: currentUser.id,
          username: currentUser.username,
          full_name: currentUser.full_name,
        });
      }
    };
  }, [isUserTyping, currentUser, dealId, socket]);

  // Render the messages content (shared between normal and fullscreen)
  const renderMessagesContent = () => (
    <>
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </motion.div>
      )}

      {/* Messages Container */}
      <motion.div
        layoutId="messages-container"
        className={`bg-gray-50 border border-gray-200 shadow-lg flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? "h-[calc(100vh-180px)] rounded-lg" : "h-96 rounded-2xl"
        }`}
        style={{
          willChange: "transform, width, height, border-radius",
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
      >
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
          {isLoading && messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-500 font-medium">Loading messages...</p>
            </motion.div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium text-lg mb-2">
                No messages yet
              </p>
              <p className="text-gray-500 text-sm">
                Start the conversation and discuss your deal!
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map((message, index) => {
                // Debug message ownership
                console.log("Message:", {
                  id: message.id,
                  senderUsername: message.senderUsername,
                  senderId: message.senderId,
                  currentUserUsername: currentUser?.username,
                  currentUserId: currentUser?.id,
                  content: message.content,
                });

                // More robust check for own message - handle multiple possible data structures
                const isOwnMessage =
                  currentUser &&
                  ((message.sender && currentUser.id === message.sender.id) ||
                    (message.senderId && currentUser.id === message.senderId) ||
                    (message.senderUsername &&
                      currentUser.username === message.senderUsername));

                const prevMessage = messages[index - 1];
                // More robust sender comparison for grouping
                const currentSenderId = message.senderId || message.sender?.id;
                const prevSenderId =
                  prevMessage?.senderId || prevMessage?.sender?.id;
                const isFirstInGroup =
                  !prevMessage || prevSenderId !== currentSenderId;

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                      delay: index < 3 ? index * 0.01 : 0, // Only stagger first 3 messages with minimal delay
                    }}
                    layout
                    className={`flex items-end gap-2 ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    } ${isFirstInGroup ? "mt-4" : "mt-1"}`}
                  >
                    {/* Avatar for other users */}
                    {!isOwnMessage && isFirstInGroup && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shadow-md">
                        {(
                          message.sender?.full_name ||
                          message.senderUsername ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    {!isOwnMessage && !isFirstInGroup && (
                      <div className="w-8 h-8"></div>
                    )}

                    <div
                      className={`flex flex-col max-w-xs lg:max-w-md ${
                        isOwnMessage ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Sender name (only for other users and first in group) */}
                      {!isOwnMessage && isFirstInGroup && (
                        <div className="text-xs text-gray-600 font-medium mb-1 px-1">
                          {message.sender?.full_name ||
                            message.senderUsername ||
                            "Unknown User"}
                        </div>
                      )}

                      {/* Message bubble */}
                      <div className="relative group">
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-100 relative ${
                            isOwnMessage
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                              : "bg-white text-gray-800 border border-gray-100 shadow-gray-300/30 hover:shadow-gray-300/50"
                          } ${
                            isFirstInGroup
                              ? isOwnMessage
                                ? "rounded-tr-md"
                                : "rounded-tl-md"
                              : ""
                          } ${
                            message.isTemporary ? "opacity-70" : "opacity-100"
                          }`}
                        >
                          {/* Message content */}
                          <div className="flex items-center gap-2">
                            <p className="text-sm leading-relaxed break-words">
                              {message.content}
                            </p>
                            {/* Sending indicator for temporary messages */}
                            {message.isTemporary && (
                              <div className="flex-shrink-0">
                                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timestamp */}
                        <div
                          className={`text-xs text-gray-400 mt-1 px-1 ${
                            isOwnMessage ? "text-right" : "text-left"
                          }`}
                        >
                          {message.isTemporary
                            ? "Sending..."
                            : formatTimestamp(message.createdAt)}
                        </div>
                      </div>
                    </div>
                    {isOwnMessage && isFirstInGroup && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold shadow-md">
                        {(currentUser?.full_name || "Me")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    {isOwnMessage && !isFirstInGroup && (
                      <div className="w-8 h-8"></div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing Indicator - Only show for other users */}
              <AnimatePresence>
                {otherUsersTyping.length > 0 &&
                  console.log(
                    "Rendering typing indicators for:",
                    otherUsersTyping
                  )}
                {otherUsersTyping.map((typingUser) => (
                  <motion.div
                    key={`typing-${typingUser.id}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 px-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold">
                      {(typingUser.full_name || typingUser.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div
          className={`border-t border-gray-200 bg-white p-4 ${
            isFullscreen ? "rounded-b-lg" : "rounded-b-2xl"
          }`}
        >
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-100 placeholder-gray-400 text-gray-700 bg-gray-50 focus:bg-white shadow-sm"
                disabled={isLoading}
                maxLength={1000}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {newMessage.length}/1000
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-2xl transition-all duration-100 shadow-lg hover:shadow-blue-500/30 disabled:shadow-none transform hover:scale-105 disabled:scale-100 active:scale-95 group"
            >
              {isLoading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <svg
                  className="w-5 h-5 transition-transform duration-100 group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </>
  );

  if (!dealId) {
    return (
      <div className="mt-6 border-t pt-6">
        <h2 className="text-2xl font-semibold mb-4">Messages</h2>
        <p className="text-gray-500">No deal selected for messaging.</p>
      </div>
    );
  }

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50"
          : "mt-8 border-t border-gray-200 pt-8"
      }
    >
      {/* Main Container with Smooth Transitions */}
      <motion.div
        layoutId="message-main-container"
        className={`${
          isFullscreen ? "w-full h-full bg-gray-50" : ""
        } flex flex-col`}
        style={{
          willChange: "transform, width, height",
        }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
      >
        {/* Header Section */}
        <motion.div
          className={`flex items-center justify-between ${
            isFullscreen ? "p-6 border-b border-gray-200 bg-white" : "mb-6"
          }`}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isFullscreen ? "Deal Messages - Fullscreen" : "Deal Messages"}
            </h2>
          </div>

          <button
            onClick={toggleFullscreen}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors duration-150 border ${
              isFullscreen
                ? "text-gray-600 hover:text-red-600 hover:bg-red-50 border-gray-200 hover:border-red-300"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-200 hover:border-blue-300"
            }`}
            title={isFullscreen ? "Exit fullscreen" : "Open fullscreen chat"}
          >
            <svg
              className="w-4 h-4 transition-transform duration-150"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                transform: isFullscreen ? "rotate(45deg)" : "rotate(0deg)",
              }}
            >
              {isFullscreen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              )}
            </svg>
            <span>{isFullscreen ? "Close" : "Fullscreen"}</span>
          </button>
        </motion.div>

        {/* Messages Content Container */}
        <motion.div
          className={`${isFullscreen ? "flex-1 p-6 overflow-hidden" : ""}`}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
        >
          {/* Messages Content */}
          <div>{renderMessagesContent()}</div>
        </motion.div>
      </motion.div>

      {/* Backdrop for fullscreen mode */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black -z-10"
            onClick={() => setIsFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Message;
