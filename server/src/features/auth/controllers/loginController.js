import bcrypt from "bcrypt";
import { userModel } from "../models/authModel.js"; // adjust import path if needed
import { generateToken } from "../../../utils/jwt.js"; // adjust path

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  try {
    const user = await userModel.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "Invalid username or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        username: user.username,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unexpected error occurred" });
  }
};
