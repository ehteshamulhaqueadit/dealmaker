import { RequestDealmaker } from "../models/requestDealmakerModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { db_connection } from "../../../../config/db_connection.js";
import socketService from "../../../utils/socketService.js";

export const acceptDealRequestController = async (req, res) => {
  const { requestId } = req.params;
  const loggedInUser = req.user.username;
  const t = await db_connection.transaction();

  try {
    // 1. Find the request
    const request = await RequestDealmaker.findByPk(requestId, {
      transaction: t,
    });

    if (!request) {
      await t.rollback();
      return res.status(404).json({ message: "Request not found." });
    }

    // 2. Validate that the logged-in user is the receiver of the request
    if (request.receiver !== loggedInUser) {
      await t.rollback();
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request." });
    }

    const { dealId } = request;

    // 3. Update the deal to assign the dealmaker
    await dealModel.update(
      { dealmaker: loggedInUser },
      { where: { id: dealId }, transaction: t }
    );

    // 4. Delete all requests associated with that deal
    await RequestDealmaker.destroy({
      where: { dealId: dealId },
      transaction: t,
    });

    // 5. Commit the transaction
    await t.commit();

    // 6. Get updated deal data and broadcast real-time update
    const updatedDeal = await dealModel.findByPk(dealId);
    socketService.broadcastDealmakerRequestUpdate(
      dealId,
      {
        dealmaker: loggedInUser,
        requestAccepted: true,
        acceptedBy: loggedInUser,
      },
      "accepted"
    );

    // Also broadcast deal update since dealmaker was assigned
    socketService.broadcastDealUpdate(
      dealId,
      updatedDeal,
      "dealmaker-assigned"
    );

    res.status(200).json({ message: "Request accepted successfully." });
  } catch (error) {
    await t.rollback();
    console.error("Failed to accept deal request:", error);
    res.status(500).json({ error: "Failed to accept deal request." });
  }
};
