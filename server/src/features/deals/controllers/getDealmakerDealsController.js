import dealModel from "../models/dealsModel.js";

export const getDealmakerDealsController = async (req, res) => {
  const username = req.user.username;

  try {
    const dealmakerDeals = await dealModel.findAll({
      where: {
        dealmaker: username,
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(dealmakerDeals);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve dealmaker deals" });
  }
};
