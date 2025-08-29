import React, { useEffect, useState, useCallback } from "react";
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
import { getEscrowStatus } from "../api/wallet";
import { motion, AnimatePresence } from "framer-motion";
import DealDetailView from "../components/DealDetailView";
import { useGlobalRealtime } from "../hooks/useSocket";

const DealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [bids, setBids] = useState([]);
  const [escrowStatuses, setEscrowStatuses] = useState({});
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
  const [selectedDealForView, setSelectedDealForView] = useState(null); // State for the detailed view
  const [loading, setLoading] = useState(true);

  const loadDeals = async () => {
    try {
      const dealsData = await fetchDeals(""); // Fetch all deals by default
      setDeals(dealsData);
      // For each deal, fetch the bids
      const bidsPromises = dealsData.map((deal) => getBidByDealId(deal.id));
      const bidsForDeals = await Promise.all(bidsPromises);
      const allBids = bidsForDeals.flat(); // Flatten the array of arrays
      setBids(allBids);

      // Load escrow statuses for deals with dealmakers
      const escrowStatuses = {};
      await Promise.all(
        dealsData.map(async (deal) => {
          if (deal.dealmaker) {
            try {
              const status = await getEscrowStatus(deal.id);
              // Flatten the escrow object structure for easier access
              if (status.escrowExists && status.escrow) {
                escrowStatuses[deal.id] = {
                  ...status.escrow,
                  creatorPaid: status.escrow.creatorPaid,
                  counterpartPaid: status.escrow.counterpartPaid,
                };
              } else {
                escrowStatuses[deal.id] = null;
              }
            } catch (error) {
              console.error(
                `Failed to fetch escrow status for deal ${deal.id}`,
                error
              );
              escrowStatuses[deal.id] = null;
            }
          }
        })
      );
      setEscrowStatuses(escrowStatuses);
    } catch (error) {
      console.error("Failed to fetch deals or bids", error);
    }
  };

  // Real-time update handlers
  const handleDealUpdate = useCallback((data) => {
    const { dealId, dealData, updateType } = data;

    console.log("Real-time deal update:", updateType, dealData);

    setDeals((prevDeals) => {
      switch (updateType) {
        case "created":
          // Add new deal if it doesn't exist
          if (!prevDeals.find((deal) => deal.id === dealData.id)) {
            return [...prevDeals, dealData];
          }
          return prevDeals;

        case "joined":
        case "left":
        case "dealmaker-assigned":
        case "finalized":
        case "updated":
          // Update existing deal
          return prevDeals.map((deal) =>
            deal.id === dealId ? { ...deal, ...dealData } : deal
          );

        case "deleted":
          // Remove deal
          return prevDeals.filter((deal) => deal.id !== dealId);

        default:
          return prevDeals;
      }
    });

    // Update myDeals if it includes this deal
    setMyDeals((prevMyDeals) => {
      if (!prevMyDeals.find((deal) => deal.id === dealId)) return prevMyDeals;

      switch (updateType) {
        case "deleted":
          return prevMyDeals.filter((deal) => deal.id !== dealId);
        default:
          return prevMyDeals.map((deal) =>
            deal.id === dealId ? { ...deal, ...dealData } : deal
          );
      }
    });
  }, []);

  const handleBidUpdate = useCallback((data) => {
    const { dealId, bidData, updateType } = data;

    console.log("Real-time bid update:", updateType, bidData);

    if (updateType === "created") {
      setBids((prevBids) => {
        // Check if bid already exists
        if (!prevBids.find((bid) => bid.id === bidData.id)) {
          return [...prevBids, bidData];
        }
        return prevBids;
      });
    } else if (updateType === "selected") {
      // Bid selection update - may affect deal state
      if (bidData.dealFinalized) {
        // Update deals to show new dealmaker
        setDeals((prevDeals) =>
          prevDeals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  dealmaker: bidData.finalDealmaker,
                  budget: bidData.finalPrice,
                }
              : deal
          )
        );

        // Remove all bids for this deal since it's finalized
        setBids((prevBids) => prevBids.filter((bid) => bid.dealId !== dealId));
      }
    }
  }, []);

  const handleDealmakerRequestUpdate = useCallback((data) => {
    const { dealId, requestData, updateType } = data;

    console.log("Real-time dealmaker request update:", updateType, requestData);

    if (updateType === "accepted") {
      // Update deal to show new dealmaker
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === dealId
            ? { ...deal, dealmaker: requestData.dealmaker }
            : deal
        )
      );

      setMyDeals((prevMyDeals) =>
        prevMyDeals.map((deal) =>
          deal.id === dealId
            ? { ...deal, dealmaker: requestData.dealmaker }
            : deal
        )
      );
    }
  }, []);

  const handleNotification = useCallback((notification) => {
    console.log("Real-time notification:", notification);
    // You can show toast notifications or update UI here
    setMessage(notification.message || "New update received");

    // Auto-clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  }, []);

  // Set up real-time WebSocket connection
  useGlobalRealtime({
    onDealUpdate: handleDealUpdate,
    onBidUpdate: handleBidUpdate,
    onDealmakerRequestUpdate: handleDealmakerRequestUpdate,
    onNotification: handleNotification,
  });

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

    const loadData = async () => {
      setLoading(true);
      await loadDeals();
      setLoading(false);
    };

    loadData();
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

      // Load escrow statuses for my deals with dealmakers
      const escrowStatuses = {};
      await Promise.all(
        data.map(async (deal) => {
          if (deal.dealmaker) {
            try {
              const status = await getEscrowStatus(deal.id);
              // Flatten the escrow object structure for easier access
              if (status.escrowExists && status.escrow) {
                escrowStatuses[deal.id] = {
                  ...status.escrow,
                  creatorPaid: status.escrow.creatorPaid,
                  counterpartPaid: status.escrow.counterpartPaid,
                };
              } else {
                escrowStatuses[deal.id] = null;
              }
            } catch (error) {
              console.error(
                `Failed to fetch escrow status for deal ${deal.id}`,
                error
              );
              escrowStatuses[deal.id] = null;
            }
          }
        })
      );
      setEscrowStatuses((prev) => ({ ...prev, ...escrowStatuses }));
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

  const handleViewDeal = (deal) => {
    setSelectedDealForView(deal);
    setIsMyDealsModalOpen(false); // Close the modal if it's open
  };

  const handleBackToDeals = () => {
    setSelectedDealForView(null);
  };

  const handleBidSelected = (updatedDeal) => {
    setSelectedDealForView(updatedDeal.deal);
    // Refresh all deals to reflect the change
    loadDeals();
  };

  if (selectedDealForView) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <DealDetailView
          deal={selectedDealForView}
          bids={bids}
          onBack={handleBackToDeals}
          onBidSelected={handleBidSelected}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Deals</h1>
      <AnimatePresence>
        {message && (
          <motion.p
            className="text-center text-green-600 mb-4 bg-green-50 border border-green-200 rounded-lg py-2 px-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by keyword"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
        />
        <button
          onClick={handleSearch}
          className="ml-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Search
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="ml-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Create Deal
        </button>
        <button
          onClick={handleLoadMyDeals}
          className="ml-4 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          My Deals
        </button>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center py-12"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading deals...</span>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold mb-2">{deal.title}</h3>
              <p className="text-gray-700 mb-2">{deal.description}</p>
              <p className="text-gray-500 mb-2">Budget: {deal.budget}</p>
              <p className="text-gray-500 mb-4">Timeline: {deal.timeline}</p>
              <p className="text-gray-500 mb-2">
                Created by: {deal.dealer_creator}
              </p>
              <p className="text-gray-500 mb-4">
                {deal.dealer_joined
                  ? `Joined by: ${deal.dealer_joined}`
                  : "No one has joined yet"}
              </p>
              <div className="flex items-center space-x-2 mt-4">
                {(() => {
                  // User is not the creator
                  const userHasBid = bids.some(
                    (bid) =>
                      bid.dealId === deal.id && bid.dealmaker === username
                  );

                  // Check if escrow has been paid by anyone (makes deal undeleteable)
                  const escrowStatus = escrowStatuses[deal.id];
                  const hasEscrowPayment =
                    escrowStatus &&
                    (escrowStatus.creatorPaid || escrowStatus.counterpartPaid);

                  // Buttons for the deal creator
                  if (deal.dealer_creator === username) {
                    // Don't show delete button if:
                    // 1. Deal has a dealmaker but no escrow yet (payment option should be shown first)
                    // 2. Anyone has made escrow payment (deal becomes protected)
                    if (hasEscrowPayment) {
                      return (
                        <motion.span
                          className="text-gray-500 italic bg-gray-100 px-3 py-1 rounded-full text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          🔒 Deal is protected - escrow payment made
                        </motion.span>
                      );
                    }

                    return (
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Delete Deal
                      </button>
                    );
                  }

                  // Buttons for other users
                  return (
                    <>
                      {/* User has joined the deal */}
                      {deal.dealer_joined === username && (
                        <>
                          {hasEscrowPayment ? (
                            <motion.span
                              className="text-gray-500 italic bg-gray-100 px-3 py-1 rounded-full text-sm"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              🔒 Cannot leave - escrow payment made
                            </motion.span>
                          ) : (
                            <button
                              onClick={() => handleLeaveDeal(deal.id)}
                              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              Leave Deal
                            </button>
                          )}
                        </>
                      )}

                      {/* User has not joined and no one else has joined */}
                      {!deal.dealer_joined &&
                        deal.dealer_creator !== username && (
                          <button
                            onClick={() => handleJoinDeal(deal.id)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            Join Deal
                          </button>
                        )}

                      {/* User can bid if they are not the creator or the joined dealer AND the deal is not finalized */}
                      {!deal.dealmaker &&
                        deal.dealer_creator !== username &&
                        deal.dealer_joined !== username &&
                        !userHasBid && (
                          <button
                            onClick={() => {
                              setIsBidModalOpen(true);
                              setSelectedDealId(deal.id);
                              setCurrentBid(null);
                              setBidPrice("");
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                          >
                            Bid as Dealmaker
                          </button>
                        )}

                      {/* User has an existing bid */}
                      {userHasBid && (
                        <>
                          <button
                            onClick={() => {
                              const userBid = bids.find(
                                (bid) =>
                                  bid.dealId === deal.id &&
                                  bid.dealmaker === username
                              );
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
                            onClick={() => {
                              const userBid = bids.find(
                                (bid) =>
                                  bid.dealId === deal.id &&
                                  bid.dealmaker === username
                              );
                              handleDeleteBid(userBid.id);
                            }}
                            className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800"
                          >
                            Delete Bid
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                />
                <textarea
                  placeholder="Description"
                  value={newDeal.description}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, description: e.target.value })
                  }
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                ></textarea>
                <input
                  type="number"
                  placeholder="Budget"
                  value={newDeal.budget}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, budget: e.target.value })
                  }
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                />
                <input
                  type="text"
                  placeholder="Timeline"
                  value={newDeal.timeline}
                  onChange={(e) =>
                    setNewDeal({ ...newDeal, timeline: e.target.value })
                  }
                  required
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-gray-400"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg mr-2 hover:bg-gray-400 transition-all duration-300 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Create Deal
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
                {myDeals.map((deal) => {
                  // Check if escrow has been paid by anyone (makes deal undeleteable)
                  const escrowStatus = escrowStatuses[deal.id];
                  const hasEscrowPayment =
                    escrowStatus &&
                    (escrowStatus.creatorPaid || escrowStatus.counterpartPaid);

                  return (
                    <div key={deal.id} className="bg-gray-100 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{deal.title}</h3>
                      <p className="text-gray-700">{deal.description}</p>
                      <p className="text-gray-500">Budget: {deal.budget}</p>
                      <p className="text-gray-500">Timeline: {deal.timeline}</p>
                      {hasEscrowPayment && (
                        <p className="text-green-600 font-medium">
                          🔒 Protected (Escrow paid)
                        </p>
                      )}
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={() => handleViewDeal(deal)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        >
                          View
                        </button>
                        {deal.dealer_creator === username ? (
                          hasEscrowPayment ? (
                            <span className="text-gray-500 text-sm italic px-4 py-2">
                              Protected - Cannot delete
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDeleteDeal(deal.id)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                            >
                              Delete Deal
                            </button>
                          )
                        ) : deal.dealer_joined === username ? (
                          hasEscrowPayment ? (
                            <span className="text-gray-500 text-sm italic px-4 py-2">
                              Protected - Cannot leave
                            </span>
                          ) : (
                            <button
                              onClick={() => handleLeaveDeal(deal.id)}
                              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                            >
                              Leave Deal
                            </button>
                          )
                        ) : null}
                      </div>
                    </div>
                  );
                })}
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
