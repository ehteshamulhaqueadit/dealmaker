import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getMyDealmakerRequests } from "../api/requestDealmaker";
import ViewRequestsModal from "./ViewRequestsModal";

const DealmakerPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  const handleViewRequests = async () => {
    try {
      const data = await getMyDealmakerRequests();
      setRequests(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch dealmaker requests:", error);
      // You might want to show a notification to the user here
    }
  };

  return (
    <motion.div
      className="p-6 border rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
    >
      <motion.h2
        className="text-2xl font-bold mb-6 text-gray-800"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Dealmaker Panel
      </motion.h2>
      <motion.button
        onClick={handleViewRequests}
        className="bg-indigo-500 text-white py-3 px-6 rounded-lg hover:bg-indigo-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        View Incoming Requests
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <ViewRequestsModal
            requests={requests}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DealmakerPanel;
