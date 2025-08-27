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
import { createBid, updateBid, deleteBid, getBidByDealId } from "../api/bids";
import { motion, AnimatePresence } from "framer-motion";

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [bids, setBids] = useState([]);
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
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [currentBid, setCurrentBid] = useState(null); // To hold the entire bid object for updates
  const [bidPrice, setBidPrice] = useState("");

  const loadDeals = async () => {
    try {
      const dealsData = await fetchDeals(""); // Fetch all deals by default
      setDeals(dealsData);
      // For each deal, fetch the bids
      const bidsPromises = dealsData.map((deal) => getBidByDealId(deal.id));
      const bidsForDeals = await Promise.all(bidsPromises);
      const allBids = bidsForDeals.flat(); // Flatten the array of arrays
      setBids(allBids);
    } catch (error) {
      console.error("Failed to fetch deals or bids", error);
    }
  };

  useEffect(() => {
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
      setDeals((prevDeals) => [
        { ...createdDeal, creatorId: username },
        ...prevDeals,
      ]);
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
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === dealId ? { ...deal, dealer_joined: username } : deal
        )
      );
      setMyDeals((prevMyDeals) =>
        prevMyDeals.map((deal) =>
          deal.id === dealId ? { ...deal, dealer_joined: username } : deal
        )
      );
      setMessage("Joined deal successfully!");
    } catch (error) {
      console.error("Failed to join deal", error);
      setMessage("Failed to join deal.");
    }
  };

  const handleLeaveDeal = async (dealId) => {
    try {
      await leaveDealAsDealer(dealId);
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === dealId ? { ...deal, dealer_joined: null } : deal
        )
      );
      setMyDeals((prevMyDeals) =>
        prevMyDeals.map((deal) =>
          deal.id === dealId ? { ...deal, dealer_joined: null } : deal
        )
      );
      setMessage("Left deal successfully!");
    } catch (error) {
      console.error("Failed to leave deal", error);
      setMessage("Failed to leave deal.");
    }
  };

  const handleDeleteDeal = async (dealId) => {
    try {
      await deleteDeal(dealId);
      setDeals((prevDeals) => prevDeals.filter((deal) => deal.id !== dealId));
      setMyDeals((prevMyDeals) =>
        prevMyDeals.filter((deal) => deal.id !== dealId)
      );
      setMessage("Deal deleted successfully!");
    } catch (error) {
      console.error("Failed to delete deal", error);
      setMessage("Failed to delete deal.");
    }
  };

  const handleCreateOrUpdateBid = async (e) => {
    e.preventDefault();
    try {
      if (currentBid) {
        await updateBid(currentBid.id, { price: bidPrice });
        setMessage("Bid updated successfully!");
      } else {
        await createBid({ dealId: selectedDealId, price: bidPrice });
        setMessage("Bid created successfully!");
      }
      setIsBidModalOpen(false);
      setCurrentBid(null);
      setBidPrice("");
      loadDeals(); // Refresh deals
    } catch (error) {
      console.error("Failed to create/update bid", error);
      setMessage("Failed to create/update bid.");
    }
  };

  const handleDeleteBid = async (bidId) => {
    try {
      await deleteBid(bidId);
      setMessage("Bid deleted successfully!");
      loadDeals(); // Refresh deals
    } catch (error) {
      console.error("Failed to delete bid", error);
      setMessage("Failed to delete bid.");
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
            <p className="text-gray-500 mb-2">Created by: {deal.creatorId}</p>
            <p className="text-gray-500 mb-4">
              {deal.dealer_joined
                ? `Joined by: ${deal.dealer_joined}`
                : "No one has joined yet"}
            </p>
            <div className="flex items-center space-x-2 mt-4">
              {(() => {
                // Condition 1: User is the creator of the deal
                if (deal.creatorId === username) {
                  return (
                    <button
                      onClick={() => handleDeleteDeal(deal.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Delete Deal
                    </button>
                  );
                } else {
                  // User is not the creator
                  if (deal.dealer_joined === username) {
                    // Condition 2: User has joined the deal
                    return (
                      <button
                        onClick={() => handleLeaveDeal(deal.id)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                      >
                        Leave Deal
                      </button>
                    );
                  } else {
                    const userBid = bids.find(
                      (bid) =>
                        bid.dealId === deal.id && bid.dealmaker === username
                    );
                    if (userBid) {
                      // Condition 3: User has created a bid
                      return (
                        <>
                          <button
                            onClick={() => {
                              setIsBidModalOpen(true);
                              setSelectedDealId(deal.id);
                              setCurrentBid(userBid);
                              setBidPrice(userBid.price);
                            }}
                            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                          >
                            Update Bid
                          </button>
                          <button
                            onClick={() => handleDeleteBid(userBid.id)}
                            className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800"
                          >
                            Delete Bid
                          </button>
                        </>
                      );
                    } else {
                      // Condition 4: User has not joined and has not bid
                      if (!deal.dealer_joined) {
                        return (
                          <>
                            <button
                              onClick={() => handleJoinDeal(deal.id)}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            >
                              Join Deal
                            </button>
                            <button
                              onClick={() => {
                                setIsBidModalOpen(true);
                                setSelectedDealId(deal.id);
                                setCurrentBid(null);
                                setBidPrice("");
                              }}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                            >
                              Bid as Dealmaker
                            </button>
                          </>
                        );
                      }
                    }
                  }
                }
                // If none of the above conditions are met (e.g., another user has joined), show nothing.
                return null;
              })()}
            </div>
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
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md h-[80vh] overflow-y-auto relative"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsMyDealsModalOpen(false)}
                className="absolute top-4 right-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
              <h2 className="text-2xl font-bold mb-4">My Deals</h2>
              <div className="space-y-4">
                {myDeals.map((deal) => (
                  <div key={deal.id} className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold">{deal.title}</h3>
                    <p className="text-gray-700">{deal.description}</p>
                    <p className="text-gray-500">Budget: {deal.budget}</p>
                    <p className="text-gray-500">Timeline: {deal.timeline}</p>
                    <div className="flex justify-end mt-2">
                      {deal.dealer_creator === username ? (
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        >
                          Delete Deal
                        </button>
                      ) : deal.dealer_joined === username ? (
                        <button
                          onClick={() => handleLeaveDeal(deal.id)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                        >
                          Leave Deal
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {isBidModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBidModalOpen(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                {currentBid ? "Update Bid" : "Bid as Dealmaker"}
              </h2>
              <form onSubmit={handleCreateOrUpdateBid}>
                <input
                  type="number"
                  placeholder="Enter your bid price"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsBidModalOpen(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    {currentBid ? "Update Bid" : "Submit Bid"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DealsPage;
