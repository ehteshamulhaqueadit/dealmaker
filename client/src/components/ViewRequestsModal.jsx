import React from "react";
import {
  acceptDealmakerRequest,
  rejectDealmakerRequest,
} from "../api/requestDealmaker";

const ViewRequestsModal = ({ requests, onClose, onAccept, onReject }) => {
  const handleAccept = async (requestId) => {
    try {
      await acceptDealmakerRequest(requestId);
      onAccept(); // This will trigger a refresh and close the modal
    } catch (error) {
      console.error("Failed to accept request:", error);
      // Optionally, show an error notification to the user
    }
  };

  const handleReject = async (requestId) => {
    try {
      await rejectDealmakerRequest(requestId);
      onReject();
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Incoming Dealmaker Requests</h2>
          <button onClick={onClose} className="text-black font-bold">
            &times;
          </button>
        </div>
        <div className="overflow-y-auto">
          {requests.length > 0 ? (
            requests.map((request) => (
              <div
                key={request.id}
                className="border p-4 rounded-lg mb-4 shadow"
              >
                <h3 className="text-xl font-semibold text-blue-600">
                  {request.deal.title}
                </h3>
                <p className="text-gray-700 my-2">{request.deal.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <span className="font-bold">Budget:</span> $
                      {request.deal.budget}
                    </p>
                    <p>
                      <span className="font-bold">Created:</span>{" "}
                      {new Date(request.deal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-bold">Deal Creator:</span>{" "}
                      {request.deal.creator.username}
                    </p>
                    <p>
                      <span className="font-bold">Counterpart:</span>{" "}
                      {request.deal.joined_user
                        ? request.deal.joined_user.username
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 border-t pt-3">
                  <p className="font-semibold">Request Message:</p>
                  <p className="text-gray-600 italic">"{request.message}"</p>
                </div>
                <div className="flex justify-end mt-4 space-x-4">
                  <button
                    onClick={() => handleReject(request.id)}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>You have no incoming dealmaker requests.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewRequestsModal;
