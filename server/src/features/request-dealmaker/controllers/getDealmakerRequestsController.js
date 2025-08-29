import { RequestDealmaker } from "../../request-dealmaker/models/requestDealmakerModel.js";
import dealModel from "../../deals/models/dealsModel.js";
import { userModel } from "../../auth/models/authModel.js";
import userData from "../../auth/models/userData.js";

export const getDealmakerRequestsController = async (req, res) => {
  const loggedInUser = req.user.username;

  try {
    // Find all requests where the logged-in user is the receiver
    const requests = await RequestDealmaker.findAll({
      where: {
        receiver: loggedInUser,
      },
      include: [
        {
          model: dealModel,
          as: "deal",
          include: [
            {
              model: userModel,
              as: "creator",
              attributes: ["username", "full_name"],
              include: {
                model: userData,
                as: "profile",
                attributes: ["profile_picture"],
              },
            },
            {
              model: userModel,
              as: "joined_user",
              attributes: ["username", "full_name"],
              include: {
                model: userData,
                as: "profile",
                attributes: ["profile_picture"],
              },
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Failed to fetch dealmaker requests:", error);
    res.status(500).json({ error: "Failed to fetch dealmaker requests" });
  }
};
