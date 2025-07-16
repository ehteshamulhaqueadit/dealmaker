import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    { username: user.username, email: user.email, jti: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
};
