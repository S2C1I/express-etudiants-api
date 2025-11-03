import User from "../Model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Helper: build a filter that supports either Mongo _id (ObjectId) or numeric id
function buildUserIdFilter(idParam) {
  if (!idParam) return null;
  // Prefer Mongo ObjectId when valid
  if (mongoose.isValidObjectId(idParam)) {
    return { _id: idParam };
  }
  // Accept purely numeric IDs for legacy numeric id field
  if (/^\d+$/.test(idParam)) {
    return { id: Number(idParam) };
  }
  return null; // invalid format
}

export async function registerUser(req, res, next) {
  const { nom, prenom, email, password, role } = req.body;
  const hasedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    nom,
    prenom,
    email,
    password: hasedPassword,
    role,
  });
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "Email already exists" });
  }
  try {
    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    next(error);
  }
}

export async function loginUser(req, res, next) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }
  const verifyPassword = await bcrypt.compare(password, user.password);
  if (!verifyPassword) {
    return res.status(400).json({ message: "Invalid password" });
  }

  try {
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
        userModel: "User", // Identify this is a User (not Etudiant)
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const filter = buildUserIdFilter(req.params.id);
    if (!filter)
      return res.status(400).json({ message: "Invalid user id format" });
    const user = await User.findOne(filter);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function addUser(req, res, next) {
  try {
    const payload = { ...req.body };
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    const newUser = new User(payload);
    await newUser.save();
    const io = req.app && req.app.get ? req.app.get("io") : null;
    if (io) io.emit("userUpdate", newUser);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const filter = buildUserIdFilter(req.params.id);
    if (!filter)
      return res.status(400).json({ message: "Invalid user id format" });
    const update = { ...req.body };
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    const user = await User.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    const io = req.app && req.app.get ? req.app.get("io") : null;
    if (io) io.emit("userUpdate", user);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const filter = buildUserIdFilter(req.params.id);
    if (!filter)
      return res.status(400).json({ message: "Invalid user id format" });
    const user = await User.findOneAndDelete(filter);
    if (!user) return res.status(404).json({ message: "User not found" });
    const io = req.app && req.app.get ? req.app.get("io") : null;
    if (io) io.emit("userDeleted", user);
    res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    next(error);
  }
}
