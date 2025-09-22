import { userModel } from "../models/authModel.js";
import { db_connection } from "../../../../config/db_connection.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

async function change_password(new_password, username) {
  if (!new_password) {
    throw new Error("New password is required");
  }

  const saltRounds = parseInt(process.env.SALTROUNDS, 10);
  if (isNaN(saltRounds)) {
    throw new Error("Invalid SALTROUNDS value in environment variables");
  }

  const transaction = await db_connection.transaction();
  const password_hash = await bcrypt.hash(new_password, saltRounds);

  try {
    await userModel.update(
      { password_reset_token: null, password_hash },
      { where: { username }, transaction }
    );
    await transaction.commit();
    return true;
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return false;
  }
}

export async function resetPasswordWithToken(req, res) {
  const token = req.params.token;
  const username = req.params.username;
  const { newPassword } = req.body;

  const password_token = await userModel.findByPk(username, {
    attributes: ["password_reset_token"],
  });

  if (password_token) {
    if (
      token == password_token.password_reset_token &&
      password_token.password_reset_token !== null
    ) {
      const result = await change_password(newPassword, username);
      result
        ? res
            .status(200)
            .json({ message: "password has been changed", success: true })
        : res
            .status(500)
            .json({ message: "internal server error", success: false });
    } else {
      res.status(500).json({ message: "invalid token", success: false });
    }
  } else {
    res.status(404).json({ message: "user not found", success: false });
  }
}
