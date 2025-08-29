import React from "react";
import { selectBid } from "../api/bidManagement";
import { getUserProfile } from "../api/userData";
import { markDealComplete } from "../api/progress";
import { lockEscrow, getEscrowStatus } from "../api/wallet";
import { useEffect, useState } from "react";
import Message from "./Message";
import RequestDealmakerModal from "./RequestDealmakerModal";
import DisputeModal from "./DisputeModal";
import ProgressModal from "./ProgressModal";

const DealDetailView = ({ deal, bids = [], onBack, onBidSelected }) => {
  const [username, setUsername] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const [updatedDeal, setUpdatedDeal] = useState(deal);
  const [escrowStatus, setEscrowStatus] = useState(null);
  const [escrowLoading, setEscrowLoading] = useState(false);
  const [escrowMessage, setEscrowMessage] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userData = await getUserProfile();
        setUsername(userData.username);
      } catch (error) {
        console.error("Failed to fetch username", error);
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    const fetchEscrowStatus = async () => {
      if (updatedDeal.dealmaker) {
        try {
          const status = await getEscrowStatus(updatedDeal.id);
          setEscrowStatus(status);
        } catch (error) {
          console.error("Failed to fetch escrow status", error);
        }
      }
    };
    fetchEscrowStatus();
  }, [updatedDeal.dealmaker, updatedDeal.id]);

  const handleSelectBid = async (bidId) => {
    try {
      const updatedDeal = await selectBid(deal.id, bidId);
      onBidSelected(updatedDeal);
    } catch (error) {
      console.error("Failed to select bid", error);
      // Optionally, show an error message to the user
    }
  };

  const handleMarkComplete = async () => {
    if (completionLoading) return;

    setCompletionLoading(true);
    try {
      const response = await markDealComplete(updatedDeal.id);
      setCompletionMessage(response.message);
      setUpdatedDeal(response.deal);

      if (response.isCompleted) {
        // If deal is completed, update the parent component
        onBidSelected(response.deal);
      }

      // Clear message after 5 seconds
      setTimeout(() => setCompletionMessage(""), 5000);
    } catch (error) {
      console.error("Failed to mark deal complete", error);
      setCompletionMessage(
        "Failed to mark deal as complete. Please try again."
      );
      setTimeout(() => setCompletionMessage(""), 5000);
    } finally {
      setCompletionLoading(false);
    }
  };

  const handleLockEscrow = async () => {
    if (escrowLoading) return;

    setEscrowLoading(true);
    try {
      const response = await lockEscrow(updatedDeal.id);
      setEscrowMessage(response.message);
      setEscrowStatus(response.escrowStatus);

      // Clear message after 5 seconds
      setTimeout(() => setEscrowMessage(""), 5000);
    } catch (error) {
      console.error("Failed to lock escrow", error);
      setEscrowMessage(
        error.response?.data?.message ||
          "Failed to lock escrow. Please try again."
      );
      setTimeout(() => setEscrowMessage(""), 5000);
    } finally {
      setEscrowLoading(false);
    }
  };

  // Filter bids for the current deal
  const dealBids = bids.filter((bid) => bid.dealId === updatedDeal.id);

  const canSelectBid =
    updatedDeal.dealer_creator === username ||
    updatedDeal.dealer_joined === username;

  const canRequestDealmaker =
    !updatedDeal.dealmaker &&
    (updatedDeal.dealer_creator === username ||
      updatedDeal.dealer_joined === username);

  const canFinishDeal =
    updatedDeal.dealmaker &&
    !updatedDeal.is_completed &&
    (updatedDeal.dealer_creator === username ||
      updatedDeal.dealer_joined === username);

  const isCreatorCompleted = updatedDeal.completed_by_creator;
  const isCounterpartCompleted = updatedDeal.completed_by_counterpart;
  const isCurrentUserCreator = updatedDeal.dealer_creator === username;
  const isCurrentUserCounterpart = updatedDeal.dealer_joined === username;
  const hasCurrentUserCompleted =
    (isCurrentUserCreator && isCreatorCompleted) ||
    (isCurrentUserCounterpart && isCounterpartCompleted);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        &larr; Back to Deals
      </button>

      {/* Deal Details */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{updatedDeal.title}</h1>
        <p className="text-lg text-gray-800 mb-4">{updatedDeal.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-gray-600 mb-6">
          <span>
            <strong>Budget:</strong> ${updatedDeal.budget}
          </span>
          <span>
            <strong>Timeline:</strong> {updatedDeal.timeline}
          </span>
          <span>
            <strong>Created:</strong>{" "}
            {new Date(updatedDeal.createdAt).toLocaleString()}
          </span>
          <span>
            <strong>Last Updated:</strong>{" "}
            {new Date(updatedDeal.updatedAt).toLocaleString()}
          </span>
        </div>

        {/* Deal Participants Box */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Deal Participants</h3>
          <div className="space-y-2">
            <p>
              <strong className="font-medium">Deal Creator:</strong>{" "}
              {updatedDeal.dealer_creator}
              {isCreatorCompleted && (
                <span className="ml-2 text-green-600 text-sm">
                  ✅ Marked as Complete
                </span>
              )}
            </p>
            {updatedDeal.dealer_joined && (
              <p>
                <strong className="font-medium">Deal Counterpart:</strong>{" "}
                {updatedDeal.dealer_joined}
                {isCounterpartCompleted && (
                  <span className="ml-2 text-green-600 text-sm">
                    ✅ Marked as Complete
                  </span>
                )}
              </p>
            )}
            {updatedDeal.dealmaker && (
              <p className="p-2 bg-green-100 text-green-800 rounded-md">
                <strong className="font-bold">Deal Maker:</strong>{" "}
                {updatedDeal.dealmaker}
              </p>
            )}
          </div>
        </div>

        {/* Escrow Payment Section */}
        {updatedDeal.dealmaker && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-800">
              💰 Escrow Payment Status
            </h3>

            {escrowStatus ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded border">
                    <p className="text-sm text-gray-600">Escrow Amount</p>
                    <p className="text-lg font-bold text-green-600">
                      ${escrowStatus.amount || updatedDeal.budget / 2}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-sm text-gray-600">Status</p>
                    <p
                      className={`text-lg font-bold ${
                        escrowStatus.status === "locked"
                          ? "text-yellow-600"
                          : escrowStatus.status === "completed"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {escrowStatus.status?.charAt(0).toUpperCase() +
                        escrowStatus.status?.slice(1) || "Pending"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Creator Payment:</strong>{" "}
                    <span
                      className={`${
                        escrowStatus.creator_paid
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {escrowStatus.creator_paid ? "✅ Paid" : "❌ Not Paid"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <strong>Counterpart Payment:</strong>{" "}
                    <span
                      className={`${
                        escrowStatus.counterpart_paid
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {escrowStatus.counterpart_paid
                        ? "✅ Paid"
                        : "❌ Not Paid"}
                    </span>
                  </p>
                </div>

                {/* Payment Action Button */}
                {escrowStatus.status !== "completed" && (
                  <div className="mt-4">
                    {((isCurrentUserCreator && !escrowStatus.creator_paid) ||
                      (isCurrentUserCounterpart &&
                        !escrowStatus.counterpart_paid)) && (
                      <button
                        onClick={handleLockEscrow}
                        disabled={escrowLoading}
                        className={`w-full py-3 px-4 rounded-lg font-medium ${
                          escrowLoading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white transition-colors`}
                      >
                        {escrowLoading
                          ? "Processing..."
                          : `Pay Escrow ($${updatedDeal.budget / 2})`}
                      </button>
                    )}

                    {escrowStatus.creator_paid &&
                      escrowStatus.counterpart_paid && (
                        <div className="text-center p-3 bg-green-100 text-green-800 rounded-md">
                          🎉 Both parties have paid! Money is now locked in
                          escrow until deal completion.
                        </div>
                      )}
                  </div>
                )}

                {escrowStatus.status === "completed" && (
                  <div className="text-center p-3 bg-green-100 text-green-800 rounded-md">
                    ✅ Escrow payment has been released to the dealmaker!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Once both parties pay ${updatedDeal.budget / 2} each into
                  escrow, the deal will be protected and no one can leave.
                </p>
                <button
                  onClick={handleLockEscrow}
                  disabled={escrowLoading}
                  className={`py-3 px-6 rounded-lg font-medium ${
                    escrowLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition-colors`}
                >
                  {escrowLoading
                    ? "Processing..."
                    : `Pay Escrow ($${updatedDeal.budget / 2})`}
                </button>
              </div>
            )}

            {escrowMessage && (
              <div
                className={`mt-3 p-3 rounded-md ${
                  escrowMessage.includes("success") ||
                  escrowMessage.includes("paid")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {escrowMessage}
              </div>
            )}
          </div>
        )}
        {/* Request Dealmaker Button */}
        {canRequestDealmaker && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Request a Dealmaker
            </button>
          </div>
        )}
      </div>

      {/* Bids Section - Conditionally Rendered */}
      {!updatedDeal.dealmaker && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-t pt-4">Bids</h2>
          {dealBids.length > 0 ? (
            <div className="space-y-4">
              {dealBids.map((bid) => {
                const isSelectedByCreator =
                  updatedDeal.selected_bid_by_creator === bid.id;
                const isSelectedByDealer =
                  updatedDeal.selected_bid_by_dealer === bid.id;
                const isFinalized = isSelectedByCreator && isSelectedByDealer;
                const isCurrentlySelectedByUser =
                  (updatedDeal.dealer_creator === username &&
                    isSelectedByCreator) ||
                  (updatedDeal.dealer_joined === username &&
                    isSelectedByDealer);

                let borderColor = "border-transparent";
                if (isFinalized) {
                  borderColor = "border-green-500"; // Both selected
                } else if (isSelectedByCreator) {
                  borderColor = "border-blue-500"; // Creator selected
                } else if (isSelectedByDealer) {
                  borderColor = "border-yellow-500"; // Dealer selected
                }

                return (
                  <div
                    key={bid.id}
                    className={`bg-gray-100 p-4 rounded-lg flex justify-between items-center border-4 ${borderColor}`}
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {bid.dealmaker}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(bid.timestamp).toLocaleString()}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        {isSelectedByCreator && (
                          <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                            Selected by Creator ({updatedDeal.dealer_creator})
                          </span>
                        )}
                        {isSelectedByDealer && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                            Selected by Counterpart ({updatedDeal.dealer_joined}
                            )
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-xl font-bold text-green-600">
                        ${bid.price}
                      </p>
                      {canSelectBid && (
                        <button
                          onClick={() => handleSelectBid(bid.id)}
                          className={`${
                            isCurrentlySelectedByUser
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-green-500 hover:bg-green-600"
                          } text-white px-4 py-2 rounded-lg`}
                        >
                          {isCurrentlySelectedByUser
                            ? "Unselect"
                            : "Select Bid"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">
              No bids have been placed on this deal yet.
            </p>
          )}
        </div>
      )}

      {/* Deal Finalized Section - Show when dealmaker is assigned */}
      {updatedDeal.dealmaker && (
        <div className="border-t pt-6 mt-6">
          {updatedDeal.is_completed ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-purple-600">
                Deal Completed ✅
              </h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-purple-800">
                  <strong>Dealmaker:</strong> {updatedDeal.dealmaker}
                </p>
                <p className="text-purple-800">
                  <strong>Final Budget:</strong> ${updatedDeal.budget}
                </p>
                <p className="text-purple-800">
                  <strong>Completed:</strong>{" "}
                  {new Date(updatedDeal.completion_date).toLocaleString()}
                </p>
                <p className="text-sm text-purple-600 mt-2">
                  🎉 This deal has been successfully completed by both parties!
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-green-600">
                Deal Finalized
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800">
                  <strong>Dealmaker:</strong> {updatedDeal.dealmaker}
                </p>
                <p className="text-green-800">
                  <strong>Final Budget:</strong> ${updatedDeal.budget}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  This deal has been finalized. Use the tools below to track
                  progress and coordinate.
                </p>
              </div>

              {/* Completion Status */}
              {(isCreatorCompleted || isCounterpartCompleted) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Completion Status:
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p
                      className={
                        isCreatorCompleted ? "text-green-700" : "text-gray-600"
                      }
                    >
                      Creator ({updatedDeal.dealer_creator}):{" "}
                      {isCreatorCompleted ? "✅ Completed" : "⏳ Pending"}
                    </p>
                    <p
                      className={
                        isCounterpartCompleted
                          ? "text-green-700"
                          : "text-gray-600"
                      }
                    >
                      Counterpart ({updatedDeal.dealer_joined}):{" "}
                      {isCounterpartCompleted ? "✅ Completed" : "⏳ Pending"}
                    </p>
                  </div>
                </div>
              )}

              {/* Completion Message */}
              {completionMessage && (
                <div
                  className={`p-3 rounded-lg mb-4 ${
                    completionMessage.includes("Failed")
                      ? "bg-red-100 border border-red-400 text-red-700"
                      : "bg-green-100 border border-green-400 text-green-700"
                  }`}
                >
                  {completionMessage}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {/* Progress Tracking Button */}
            <button
              onClick={() => setIsProgressModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Track Progress
            </button>

            {/* Dispute Management Button */}
            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Manage Disputes
            </button>

            {/* Finish Deal Button */}
            {canFinishDeal && (
              <button
                onClick={handleMarkComplete}
                disabled={completionLoading || hasCurrentUserCompleted}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  hasCurrentUserCompleted
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : completionLoading
                    ? "bg-purple-400 text-white cursor-wait"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {completionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : hasCurrentUserCompleted ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Completed
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Mark as Finished
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Deal Messages - Always show for participants */}
      <Message dealId={updatedDeal.id} />

      {isModalOpen && (
        <RequestDealmakerModal
          dealId={updatedDeal.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isDisputeModalOpen && (
        <DisputeModal
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          dealId={updatedDeal.id}
          deal={updatedDeal}
        />
      )}

      {isProgressModalOpen && (
        <ProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => setIsProgressModalOpen(false)}
          dealId={updatedDeal.id}
          deal={updatedDeal}
        />
      )}
    </div>
  );
};

export default DealDetailView;
