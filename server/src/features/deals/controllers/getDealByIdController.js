import Deal from "../models/dealsModel.js";
import Bidding from "../../bidding/models/biddingModel.js";
import { userDataModel as UserData } from "../../auth/models/userData.js";

const getDealByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find the deal by its ID
    const deal = await Deal.findByPk(id);

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Find the user's data to get their username
    const user = await UserData.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const username = user.username;

    // Check if the user is the creator of the deal
    if (deal.creatorId === username) {
      return res.status(200).json(deal);
    }

    // Check if the user has joined the deal
    if (deal.dealer_joined === username) {
      return res.status(200).json(deal);
    }

    // Check if the user has placed a bid on the deal
    const bid = await Bidding.findOne({
      where: {
        dealId: id,
        dealmaker: username,
      },
    });

    if (bid) {
      return res.status(200).json(deal);
    }

    // If none of the conditions are met, the user is not authorized
    return res
      .status(403)
      .json({ message: "You are not authorized to view this deal" });
  } catch (error) {
    console.error("Error fetching deal:", error);
    res.status(500).json({ message: "Server error while fetching deal" });
  }
};

export { getDealByIdController };
