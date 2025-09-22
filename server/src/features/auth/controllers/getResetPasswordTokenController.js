import { userModel } from "../models/authModel.js";
import crypto from "crypto";
import sendMail from "../../../../config/mailer.js";
import { db_connection } from "../../../../config/db_connection.js";
import dotenv from "dotenv";
dotenv.config();

async function send_reset_password_token(username) {
  const transaction = await db_connection.transaction();

  const token = crypto.randomBytes(32).toString("hex");
  try {
    await userModel.update(
      { password_reset_token: token },
      { where: { username }, transaction }
    );
    const user_email = await userModel.findByPk(username, {
      attributes: ["email"],
      transaction,
    });
    const reset_password_url = `${process.env.DOMAIN}/api/auth/reset_password/${username}/${token}`;
    const email_response = await sendMail(
      user_email.email,
      "Reset Password",
      "To reset the password in BFCR please click the link bellow and do not share it with anyone",
      reset_password_url
    );
    if (!email_response.status) {
      await transaction.rollback();
      return false;
    }
    await transaction.commit();
    return true;
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return false;
  }
}

export const getResetPasswordToken = async (req, res) => {
  const { username, email } = req.body;

  if (username) {
    const temp_username = await userModel.findOne({
      where: { username },
      attributes: ["username"],
    });

    const result = temp_username
      ? await send_reset_password_token(temp_username.username)
      : false;
    result
      ? res.status(200).json({
          message: "password reset email has been sent",
          success: result,
        })
      : res.status(404).json({ message: "user not found ", success: result });
  } else if (email) {
    const username = await userModel.findOne({
      where: { email },
      attributes: ["username"],
    });

    const result = username
      ? await send_reset_password_token(username.username)
      : false;
    result
      ? res.status(200).json({
          message: "password reset email has been sent",
          success: result,
        })
      : res.status(404).json({ message: "user not found", success: result });
  } else {
    res.status(400).json({
      message: "username or email field is required",
    });
  }
};
