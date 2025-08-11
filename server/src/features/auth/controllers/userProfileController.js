import { userDataModel } from "../models/userData.js";

// GET user profile info
export const getUserProfile = async (req, res) => {
  try {
    const username = req.user.username;
    const profile = await userDataModel.findOne({ where: { username } });

    res.status(200).json(profile || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// UPDATE or CREATE user profile info
export const updateUserProfile = async (req, res) => {
  try {
    const username = req.user.username;
    const { date_of_birth, photo, address, occupation } = req.body;

    const [profile, created] = await userDataModel.upsert({
      username,
      date_of_birth,
      photo,
      address,
      occupation,
    });

    res.status(200).json({ message: "Profile saved successfully", profile });
  } catch (error) {
    res.status(500).json({ error: "Failed to save profile" });
  }
};
