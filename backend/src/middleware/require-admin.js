import User from "../models/User.js";

export default async (req, res, next) => {
  const userId = req.headers["x-user-id"] || "";
  const actualUser = await User.findById(userId);
  if (!actualUser) {
    return res.status(401).json({ error: "Unauthorized: user not found" });
  }

  const role = actualUser.role;
  if (role !== "admin") {
    return res.status(401).json({ error: "Unauthorized: user is not admin" });
  }

  next();
};
