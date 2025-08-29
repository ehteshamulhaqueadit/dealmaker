import { RequestDealmaker } from "../models/requestDealmakerModel.js";

export const getRequestsByDealController = async (req, res) => {
  const { dealId } = req.params;

  try {
    const requests = await RequestDealmaker.findAll({
      where: { dealId },
      order: [["createdAt", "DESC"]],
    });
    // Manually rename the fields to match frontend expectations
    const formattedRequests = requests.map((r) => ({
      id: r.id,
      dealId: r.dealId,
      senderUsername: r.sender,
      receiverUsername: r.receiver,
      message: r.message,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error("Failed to retrieve requests for the deal:", error);
    res.status(500).json({ error: "Failed to retrieve requests" });
  }
};
