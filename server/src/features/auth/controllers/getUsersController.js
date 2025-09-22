import { userModel } from "../models/authModel.js";
import { userDataModel } from "../models/userData.js";
import { Op } from "sequelize";

// Get all users except the current user
export const getAllUsers = async (req, res) => {
  try {
    const currentUsername = req.user.username;

    const users = await userModel.findAll({
      where: {
        username: {
          [Op.ne]: currentUsername, // Exclude current user
        },
      },
      attributes: ["username", "full_name", "email", "createdAt", "updatedAt"],
      include: {
        model: userDataModel,
        as: "profile",
        attributes: ["profile_picture"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Search users by username or name
export const searchUsers = async (req, res) => {
  try {
    const currentUsername = req.user.username;
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const users = await userModel.findAll({
      where: {
        username: {
          [Op.ne]: currentUsername, // Exclude current user
        },
        [Op.or]: [
          {
            username: {
              [Op.iLike]: `%${q}%`,
            },
          },
          {
            full_name: {
              [Op.iLike]: `%${q}%`,
            },
          },
        ],
      },
      attributes: ["username", "full_name", "email", "createdAt", "updatedAt"],
      include: {
        model: userDataModel,
        as: "profile",
        attributes: ["profile_picture"],
      },
      order: [["createdAt", "DESC"]],
      limit: 50, // Limit results to prevent performance issues
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({
      message: "Error searching users",
      error: error.message,
    });
  }
};

// Get user details by username
export const getUserDetails = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        message: "Username is required",
      });
    }

    const user = await userModel.findOne({
      where: { username },
      attributes: ["username", "full_name", "email", "createdAt", "updatedAt"],
      include: {
        model: userDataModel,
        as: "profile",
        attributes: [
          "profile_picture",
          "date_of_birth",
          "address",
          "occupation",
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
};
