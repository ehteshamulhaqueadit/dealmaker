import jwt from "jsonwebtoken";
import { blacklistedTokenModel } from "../models/authModel.js"; // adjust path as needed

export const authentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if jti is blacklisted
    const isBlacklisted = await blacklistedTokenModel.findOne({
      where: { tokenUUID: decoded.jti },
    });

    if (isBlacklisted) {
      return res.status(403).json({ message: "Token has been revoked" });
    }

    req.user = decoded; // Attach decoded user data
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is invalid or expired" });
  }
};
