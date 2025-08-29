import React, { useState } from "react";
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
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Dealmaker Panel</h2>
      <button
        onClick={handleViewRequests}
        className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
      >
        View Requests
      </button>

      {isModalOpen && (
        <ViewRequestsModal
          requests={requests}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default DealmakerPanel;
