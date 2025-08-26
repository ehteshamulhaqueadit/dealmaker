import { userDataModel } from "../models/userData.js";
import { userModel } from "../models/authModel.js";
// GET user profile info
export const getUserProfile = async (req, res) => {
  try {
    const username = req.user.username;

    const user = await userModel.findOne({
      where: { username },
      include: {
        model: userDataModel,
        as: "profile",
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      password_reset_token: user.password_reset_token,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: {
        date_of_birth: user.profile?.date_of_birth || null,
        address: user.profile?.address || null,
        occupation: user.profile?.occupation || null,
        createdAt: user.profile?.createdAt || null,
        updatedAt: user.profile?.updatedAt || null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// UPDATE or CREATE user profile info
export const updateUserProfile = async (req, res) => {
  try {
    const username = req.user.username;
    const { full_name, date_of_birth, address, occupation } = req.body;
    console.log(full_name, date_of_birth, address, occupation);
    // Update fields in userModel (excluding username and email)
    await userModel.update({ full_name }, { where: { username } });

    const [userData, created] = await userDataModel.findOrCreate({
      where: { username },
      defaults: { date_of_birth, address, occupation },
    });

    if (!created) {
      await userData.update({ date_of_birth, address, occupation });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      updated: {
        full_name,
        date_of_birth,
        address,
        occupation,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
