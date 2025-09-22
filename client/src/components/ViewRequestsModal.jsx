import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  acceptDealmakerRequest,
  rejectDealmakerRequest,
} from "../api/requestDealmaker";

const ViewRequestsModal = ({ requests, onClose, onAccept, onReject }) => {
  const handleAccept = async (requestId) => {
    try {
      await acceptDealmakerRequest(requestId);
      onAccept(); // This will trigger a refresh and close the modal
    } catch (error) {
      console.error("Failed to accept request:", error);
      // Optionally, show an error notification to the user
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectDealmakerRequest(requestId);
      onReject();
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
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
              Incoming Dealmaker Requests
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
            className="overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {requests.length > 0 ? (
              requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  className="border p-4 rounded-lg mb-4 shadow hover:shadow-lg transition-shadow duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <motion.h3
                    className="text-xl font-semibold text-blue-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                  >
                    {request.deal.title}
                  </motion.h3>
                  <motion.p
                    className="text-gray-700 my-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                  >
                    {request.deal.description}
                  </motion.p>
                  <motion.div
                    className="grid grid-cols-2 gap-4 text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                  >
                    <div>
                      <p>
                        <span className="font-bold">Budget:</span> $
                        {request.deal.budget}
                      </p>
                      <p>
                        <span className="font-bold">Created:</span>{" "}
                        {new Date(request.deal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-bold">Deal Creator:</span>{" "}
                        {request.deal.creator.username}
                      </p>
                      <p>
                        <span className="font-bold">Counterpart:</span>{" "}
                        {request.deal.joined_user
                          ? request.deal.joined_user.username
                          : "N/A"}
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="mt-3 border-t pt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                  >
                    <p className="font-semibold">Request Message:</p>
                    <p className="text-gray-600 italic">"{request.message}"</p>
                  </motion.div>
                  <motion.div
                    className="flex justify-end mt-4 space-x-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                  >
                    <motion.button
                      onClick={() => handleReject(request.id)}
                      className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reject
                    </motion.button>
                    <motion.button
                      onClick={() => handleAccept(request.id)}
                      className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Accept
                    </motion.button>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <motion.p
                className="text-gray-500 text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                You have no incoming dealmaker requests.
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewRequestsModal;
