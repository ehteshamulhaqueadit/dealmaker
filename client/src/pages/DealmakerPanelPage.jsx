import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import DealDetailView from "../components/DealDetailView";

const DealmakerPanelPage = () => {
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [view, setView] = useState("grid"); // 'grid' or 'detail'

  const fetchDealmakerDeals = async () => {
    try {
      const response = await axiosInstance.get("deals/dealmaker-deals");
      setDeals(response.data);
    } catch (error) {
      console.error("Failed to fetch dealmaker deals:", error);
    }
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
      <h1 className="text-2xl font-bold mb-4">Dealmaker Panel</h1>
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
    </div>
  );
};

export default DealmakerPanelPage;
