import { userDataModel } from "../models/userData.js";
import { userModel } from "../models/authModel.js";
import fs from "fs";
import path from "path";
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
        profile_picture: user.profile?.profile_picture || null,
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

// UPLOAD profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const username = req.user.username;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get or create user data record
    const [userData, created] = await userDataModel.findOrCreate({
      where: { username },
      defaults: {},
    });

    // Delete old profile picture if it exists
    if (userData.profile_picture) {
      const oldPicturePath = path.join(process.cwd(), userData.profile_picture);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }

    // Update with new profile picture path
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
    await userData.update({ profile_picture: profilePictureUrl });

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePictureUrl: profilePictureUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
};

// DELETE profile picture
export const deleteProfilePicture = async (req, res) => {
  try {
    const username = req.user.username;

    const userData = await userDataModel.findOne({
      where: { username },
    });

    if (!userData || !userData.profile_picture) {
      return res.status(404).json({ error: "No profile picture found" });
    }

    // Delete file from filesystem
    const picturePath = path.join(process.cwd(), userData.profile_picture);
    if (fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath);
    }

    // Update database
    await userData.update({ profile_picture: null });

    res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete profile picture" });
  }
};
