import { Op } from "sequelize";
import { userModel, tempUserModel } from "../models/authModel.js";
import { db_connection } from "../../../../config/db_connection.js"; // ensure db_connection is exported

import bcrypt from "bcrypt";
import sendMail from "../../../../config/mailer.js";
import crypto from "crypto";

export const registerController = async (req, res) => {
  const { username, password, email, full_name } = req.body;

  if (!username || !password || !email || !full_name) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Start a transaction
  const transaction = await db_connection.transaction();

  try {
    // Check for existing users inside the transaction (optional but recommended)
    const existingUser = await Promise.all([
      userModel.findOne({
        where: { [Op.or]: [{ username }, { email }] },
        transaction,
      }),
      tempUserModel.findOne({
        where: { [Op.or]: [{ username }, { email }] },
        transaction,
      }),
    ]);

    if (existingUser.some((user) => user)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Username or email already exists or is taken.",
      });
    }

    const saltRounds = parseInt(process.env.SALTROUNDS, 10); // 10 is the base here
    const password_hash = await bcrypt.hash(password, saltRounds);
    const unique_link = crypto.randomBytes(32).toString("hex");

    // Create temp user within the transaction
    const newUser = await tempUserModel.create(
      {
        username,
        password_hash,
        email,
        full_name,
        unique_link,
      },
      { transaction }
    );

    const confirmationUrl = `${process.env.DOMAIN}/api/auth/register/${unique_link}`;

    // Attempt to send email
    const emailResponse = await sendMail(
      email,
      "Welcome to BFCR - Confirm Your Email",
      "Please confirm your email by clicking the link below:",
      confirmationUrl
    );

    if (!emailResponse.status) {
      // If email sending failed, rollback and respond
      console.log("Email sending failed:", emailResponse.error);
      await transaction.rollback();
      return res.status(500).json({
        message: "Failed to send confirmation email. Please try again later.",
      });
    }

    // Commit transaction after successful email
    await transaction.commit();

    console.log("Response sent:", {
      message:
        "User registered successfully. Please check your email to confirm.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
      },
    });

    res.status(200).json({
      message:
        "User registered successfully. Please check your email to confirm.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
