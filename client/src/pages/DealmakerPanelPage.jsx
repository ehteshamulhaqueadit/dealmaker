import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dealmaker Panel</h1>
        <button
          onClick={handleViewRequests}
          className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
        >
          View Incoming Requests
        </button>
      </div>
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {deals.map((deal) => (
          <motion.div
            layout
            key={deal.id}
            className="border p-4 rounded-lg shadow-lg"
          >
            <h2 className="text-xl font-semibold">{deal.title}</h2>
            <p className="text-gray-600">{deal.description}</p>
            <p className="text-lg font-bold mt-2">Budget: ${deal.budget}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleViewDeal(deal)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
      {isRequestsModalOpen && (
        <ViewRequestsModal
          requests={requests}
          onClose={() => setIsRequestsModalOpen(false)}
          onAccept={handleRequestAccepted}
          onReject={handleRequestRejected}
        />
      )}
    </div>
  );
};

export default DealmakerPanelPage;
