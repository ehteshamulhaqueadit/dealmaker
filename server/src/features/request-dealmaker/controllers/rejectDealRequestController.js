import { RequestDealmaker } from "../models/requestDealmakerModel.js";

export const rejectDealRequestController = async (req, res) => {
  const { requestId } = req.params;
  const loggedInUser = req.user.username;

  try {
    const request = await RequestDealmaker.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (request.receiver !== loggedInUser) {
      return res
        .status(403)
        .json({ message: "You are not authorized to reject this request." });
    }

    // Update the request to mark it as rejected
    await request.update({ rejected: true });

    res.status(200).json({ message: "Request rejected successfully." });
  } catch (error) {
    console.error("Failed to reject deal request:", error);
    res.status(500).json({ error: "Failed to reject deal request." });
  }
};
