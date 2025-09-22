import { userModel } from "../models/authModel.js";
import { userDataModel } from "../models/userData.js";

export const getOnePublicInfoController = async (req, res) => {
  const { username } = req.params;
  const loggedInUser = req.user.username;

  if (username === loggedInUser) {
    return res
      .status(400)
      .json({ error: "Cannot fetch public info for the current user." });
  }

  try {
    const user = await userModel.findOne({
      where: {
        username: username,
      },
      include: {
        model: userDataModel,
        as: "profile",
      },
      attributes: { exclude: ["password_hash", "password_reset_token"] },
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Failed to fetch public user info:", error);
    res.status(500).json({ error: "Failed to fetch public user info" });
  }
};
