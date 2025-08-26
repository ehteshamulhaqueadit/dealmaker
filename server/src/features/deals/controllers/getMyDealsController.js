import dealModel from "../models/dealsModel.js";

export const getMyDealsController = async (req, res) => {
  const dealer_creator = req.user.username;

  try {
    const myDeals = await dealModel.findAll({
      where: { dealer_creator },
      order: [["createdAt", "DESC"]], // Sort by createdAt in descending order
    });
    res.status(200).json(myDeals);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve deals" });
  }
};
