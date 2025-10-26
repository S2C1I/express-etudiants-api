import User from "../Model/User.js";

export async function roleVerification(req, res, next) {
  const userId = req.user._id;
  const user = await User.findOne({ userId });

  console.log("user : ", user);

  if (user && user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}
