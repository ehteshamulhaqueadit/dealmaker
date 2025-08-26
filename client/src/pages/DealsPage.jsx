import React, { useEffect, useState } from "react";
import {
  fetchDeals,
  fetchMyDeals,
  createDeal,
  joinDealAsDealer,
  leaveDealAsDealer,
  deleteDeal,
} from "../api/deals";
import { getUserProfile } from "../api/userData";
import { motion, AnimatePresence } from "framer-motion";

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [newDeal, setNewDeal] = useState({
    title: "",
    description: "",
    budget: "",
    timeline: "",
  });
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMyDealsModalOpen, setIsMyDealsModalOpen] = useState(false);
  const [username, setUsername] = useState(null); // State to store the logged-in user's username

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const data = await fetchDeals(""); // Fetch all deals by default
        console.log("Deals data:", data); // Log deals data to verify creatorId
        setDeals(data);
      } catch (error) {
        console.error("Failed to fetch deals", error);
      }
    };

    const fetchUsername = async () => {
      try {
        const userData = await getUserProfile(); // Use the existing API function to fetch user profile
        console.log("Username:", userData.username); // Log username to verify
        setUsername(userData.username);
      } catch (error) {
        console.error("Failed to fetch username", error);
      }
    };

    loadDeals();
    fetchUsername();
  }, []);

  const handleSearch = async () => {
    try {
      const data = await fetchDeals(keyword);
      setDeals(data);
    } catch (error) {
      console.error("Failed to fetch deals", error);
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      const createdDeal = await createDeal(newDeal);
      setDeals([createdDeal, ...deals]);
      setNewDeal({ title: "", description: "", budget: "", timeline: "" });
      setMessage("Deal created successfully!");
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create deal", error);
      setMessage("Failed to create deal.");
    }
  };

  const handleLoadMyDeals = async () => {
    try {
      const data = await fetchMyDeals();
      setMyDeals(data);
      setIsMyDealsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch my deals", error);
    }
  };

  const handleJoinDeal = async (dealId) => {
    try {
      await joinDealAsDealer(dealId);
      setMessage("Joined deal successfully!");
    } catch (error) {
      console.error("Failed to join deal", error);
      setMessage("Failed to join deal.");
    }
  };

  const handleLeaveDeal = async (dealId) => {
    try {
      await leaveDealAsDealer(dealId);
      setMessage("Left deal successfully!");
    } catch (error) {
      console.error("Failed to leave deal", error);
      setMessage("Failed to leave deal.");
    }
  };

  const handleDeleteDeal = async (dealId) => {
    try {
      await deleteDeal(dealId);
      setDeals(deals.filter((deal) => deal.id !== dealId));
      setMessage("Deal deleted successfully!");
    } catch (error) {
      console.error("Failed to delete deal", error);
      setMessage("Failed to delete deal.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Deals</h1>
      {message && <p className="text-center text-green-600 mb-4">{message}</p>}

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md"
        />
        <button
          onClick={handleSearch}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="ml-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Create Deal
        </button>
        <button
          onClick={handleLoadMyDeals}
          className="ml-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
        >
          My Deals
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">{deal.title}</h3>
            <p className="text-gray-700 mb-2">{deal.description}</p>
            <p className="text-gray-500 mb-2">Budget: {deal.budget}</p>
            <p className="text-gray-500 mb-4">Timeline: {deal.timeline}</p>
            {deal.creatorId === username ? (
              <button
                onClick={() => handleDeleteDeal(deal.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete Deal
              </button>
            ) : (
              <button
                onClick={() => handleJoinDeal(deal.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Join Deal
              </button>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Create a New Deal</h2>
              <form onSubmit={handleCreateDeal}>
                <input
                  type="text"
                  placeholder="Title"
                  value={newDeal.title}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, title: e.target.value })
                  }
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                />
                <textarea
                  placeholder="Description"
                  value={newDeal.description}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, description: e.target.value })
                  }
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                ></textarea>
                <input
                  type="number"
                  placeholder="Budget"
                  value={newDeal.budget}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, budget: e.target.value })
                  }
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                />
                <input
                  type="text"
                  placeholder="Timeline"
                  value={newDeal.timeline}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, timeline: e.target.value })
                  }
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isMyDealsModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMyDealsModalOpen(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">My Deals</h2>
              <div className="space-y-4">
                {myDeals.map((deal) => (
                  <div key={deal.id} className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold">{deal.title}</h3>
                    <p className="text-gray-700">{deal.description}</p>
                    <p className="text-gray-500">Budget: {deal.budget}</p>
                    <p className="text-gray-500">Timeline: {deal.timeline}</p>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleLeaveDeal(deal.id)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 mr-2"
                      >
                        Leave Deal
                      </button>
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                      >
                        Delete Deal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setIsMyDealsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DealsPage;
