import dealModel from "../models/dealsModel.js";

export const joinDealAsDealerController = async (req, res) => {
  const dealId = req.params.id;
  const username = req.user.username;
  try {
    const deal = await dealModel.findByPk(dealId);
    if (!deal) {
      return res.status(404).json({ error: "Deal not found" });
    }
    // Logic to add user as dealer for the deal
    if (deal.dealer_creator === username || deal.dealmaker === username) {
      return res.status(400).json({ error: "You are already in this deal" });
    }
    // Added logic to update dealer_joined column
    if (deal.dealer_joined) {
      return res
        .status(400)
        .json({ error: "This deal already has a dealer joined" });
    }
    await deal.update({ dealer_joined: username });
    res.status(200).json({ message: "User added as dealer successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to join deal as dealer" });
  }
};
