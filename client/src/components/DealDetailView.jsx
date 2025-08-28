import React from "react";

const DealDetailView = ({ deal, bids, onBack }) => {
  // Filter bids for the current deal
  const dealBids = bids.filter((bid) => bid.dealId === deal.id);

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
        <p className="text-gray-500 mb-4">Created by: {deal.creatorId}</p>
        <p className="text-lg text-gray-800 mb-4">{deal.description}</p>
        <div className="flex items-center space-x-6 text-gray-600">
          <span>
            <strong>Budget:</strong> {deal.budget}
          </span>
          <span>
            <strong>Timeline:</strong> {deal.timeline}
          </span>
          <span>
            <strong>Status:</strong>{" "}
            {deal.dealer_joined
              ? `Joined by ${deal.dealer_joined}`
              : "Open for Bids"}
          </span>
        </div>
      </div>

      {/* Bids Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 border-t pt-4">Bids</h2>
        {dealBids.length > 0 ? (
          <div className="space-y-4">
            {dealBids.map((bid) => (
              <div
                key={bid.id}
                className="bg-gray-100 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">{bid.dealmaker}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(bid.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-xl font-bold text-green-600">${bid.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No bids have been placed on this deal yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default DealDetailView;
