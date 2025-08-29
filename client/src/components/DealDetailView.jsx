import React from "react";
import { selectBid } from "../api/bidManagement";
import { getUserProfile } from "../api/userData";
import { useEffect, useState } from "react";
import Message from "./Message";
import RequestDealmakerModal from "./RequestDealmakerModal";
import DisputeModal from "./DisputeModal";

const DealDetailView = ({ deal, bids = [], onBack, onBidSelected }) => {
  const [username, setUsername] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

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

  const handleSelectBid = async (bidId) => {
    try {
      const updatedDeal = await selectBid(deal.id, bidId);
      onBidSelected(updatedDeal);
    } catch (error) {
      console.error("Failed to select bid", error);
      // Optionally, show an error message to the user
    }
  };

  // Filter bids for the current deal
  const dealBids = bids.filter((bid) => bid.dealId === deal.id);

  const canSelectBid =
    deal.dealer_creator === username || deal.dealer_joined === username;

  const canRequestDealmaker =
    !deal.dealmaker &&
    (deal.dealer_creator === username || deal.dealer_joined === username);

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
        <h1 className="text-4xl font-bold mb-2">{deal.title}</h1>
        <p className="text-lg text-gray-800 mb-4">{deal.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-gray-600 mb-6">
          <span>
            <strong>Budget:</strong> ${deal.budget}
          </span>
          <span>
            <strong>Timeline:</strong> {deal.timeline}
          </span>
          <span>
            <strong>Created:</strong>{" "}
            {new Date(deal.createdAt).toLocaleString()}
          </span>
          <span>
            <strong>Last Updated:</strong>{" "}
            {new Date(deal.updatedAt).toLocaleString()}
          </span>
        </div>

        {/* Deal Participants Box */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Deal Participants</h3>
          <div className="space-y-2">
            <p>
              <strong className="font-medium">Deal Creator:</strong>{" "}
              {deal.dealer_creator}
            </p>
            {deal.dealer_joined && (
              <p>
                <strong className="font-medium">Deal Counterpart:</strong>{" "}
                {deal.dealer_joined}
              </p>
            )}
            {deal.dealmaker && (
              <p className="p-2 bg-green-100 text-green-800 rounded-md">
                <strong className="font-bold">Deal Maker:</strong>{" "}
                {deal.dealmaker}
              </p>
            )}
          </div>
        </div>
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
      {!deal.dealmaker && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 border-t pt-4">Bids</h2>
          {dealBids.length > 0 ? (
            <div className="space-y-4">
              {dealBids.map((bid) => {
                const isSelectedByCreator =
                  deal.selected_bid_by_creator === bid.id;
                const isSelectedByDealer =
                  deal.selected_bid_by_dealer === bid.id;
                const isFinalized = isSelectedByCreator && isSelectedByDealer;
                const isCurrentlySelectedByUser =
                  (deal.dealer_creator === username && isSelectedByCreator) ||
                  (deal.dealer_joined === username && isSelectedByDealer);

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
                            Selected by Creator ({deal.dealer_creator})
                          </span>
                        )}
                        {isSelectedByDealer && (
                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                            Selected by Dealer ({deal.dealer_joined})
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
      {deal.dealmaker && (
        <div className="border-t pt-6 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">
            Deal Finalized
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800">
              <strong>Dealmaker:</strong> {deal.dealmaker}
            </p>
            <p className="text-green-800">
              <strong>Final Budget:</strong> ${deal.budget}
            </p>
            <p className="text-sm text-green-600 mt-2">
              This deal has been finalized. Use the messaging section below to
              coordinate with your dealmaker and counterpart.
            </p>
          </div>

          {/* Dispute Management Button */}
          <div className="mb-4">
            <button
              onClick={() => setIsDisputeModalOpen(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
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
          </div>
        </div>
      )}

      {/* Deal Messages - Always show for participants */}
      <Message dealId={deal.id} />

      {isModalOpen && (
        <RequestDealmakerModal
          dealId={deal.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isDisputeModalOpen && (
        <DisputeModal
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          dealId={deal.id}
          deal={deal}
        />
      )}
    </div>
  );
};

export default DealDetailView;
