import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import DealDetailView from "../components/DealDetailView";
import { getMyDealmakerRequests } from "../api/requestDealmaker";
import ViewRequestsModal from "../components/ViewRequestsModal";

const DealmakerPanelPage = () => {
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [view, setView] = useState("grid"); // 'grid' or 'detail'
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  const fetchDealmakerDeals = async () => {
    try {
      const response = await axiosInstance.get("deals/dealmaker-deals");
      setDeals(response.data);
    } catch (error) {
      console.error("Failed to fetch dealmaker deals:", error);
    }
  };

  const handleViewRequests = async () => {
    try {
      const data = await getMyDealmakerRequests();
      setRequests(data);
      setIsRequestsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch dealmaker requests:", error);
    }
  };

  const handleRequestAccepted = () => {
    setIsRequestsModalOpen(false); // Close the modal
    fetchDealmakerDeals(); // Refresh the deals list
  };

  const handleRequestRejected = () => {
    // Refetch the requests to update the modal view
    handleViewRequests();
  };

  useEffect(() => {
    fetchDealmakerDeals();
  }, []);

  const handleViewDeal = (deal) => {
    setSelectedDeal(deal);
    setView("detail");
  };

  const handleBackToGrid = () => {
    setSelectedDeal(null);
    setView("grid");
    fetchDealmakerDeals(); // Refetch to get the latest data
  };

  if (view === "detail" && selectedDeal) {
    return (
      <DealDetailView
        deal={selectedDeal}
        onBack={handleBackToGrid}
        onDealUpdated={fetchDealmakerDeals}
      />
    );
  }

  return (
    <motion.div
      className="container mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl font-bold text-gray-800"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Dealmaker Panel
        </motion.h1>
        <motion.button
          onClick={handleViewRequests}
          className="bg-indigo-500 text-white py-3 px-6 rounded-lg hover:bg-indigo-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Incoming Requests
        </motion.button>
      </motion.div>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {deals.map((deal, index) => (
          <motion.div
            layout
            key={deal.id}
            className="border p-6 rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.5 + index * 0.1,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.h2
              className="text-xl font-semibold mb-3 text-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
            >
              {deal.title}
            </motion.h2>
            <motion.p
              className="text-gray-600 mb-4 line-clamp-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
            >
              {deal.description}
            </motion.p>
            <motion.p
              className="text-lg font-bold mt-3 text-green-600"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
            >
              Budget: ${deal.budget}
            </motion.p>
            <motion.div
              className="mt-6 flex justify-end"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
            >
              <motion.button
                onClick={() => handleViewDeal(deal)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Deal
              </motion.button>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {isRequestsModalOpen && (
          <ViewRequestsModal
            requests={requests}
            onClose={() => setIsRequestsModalOpen(false)}
            onAccept={handleRequestAccepted}
            onReject={handleRequestRejected}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DealmakerPanelPage;
