import { db_connection } from "../../../../config/db_connection.js"; // adjust this path to your Sequelize instance
import { userModel, tempUserModel } from "../models/authModel.js";

export const confirmEmailController = async (req, res) => {
  const unique_link_from_req = req.params.confirmation_url;

  const transaction = await db_connection.transaction();

  try {
    const registered_user_data = await tempUserModel.findByPk(
      unique_link_from_req,
      { transaction }
    );

    if (!registered_user_data) {
      await transaction.rollback();
      return res.status(404).json({ message: "Invalid confirmation link" });
    }

    const temp_user = {
      full_name: registered_user_data.full_name,
      email: registered_user_data.email,
      password_hash: registered_user_data.password_hash,
      username: registered_user_data.username,
    };

    await userModel.create(temp_user, { transaction });

    await tempUserModel.destroy({
      where: { unique_link: unique_link_from_req },
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({ message: "Email has been verified" });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return res.status(500).json({ message: "Unexpected error occurred" });
  }
};
