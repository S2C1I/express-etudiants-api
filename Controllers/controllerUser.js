import User from "../Model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function addUser(req, res, next) {
  try {
    const newUser = new User(req.body);
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
    const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, {
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
    const user = await User.findOneAndDelete({ id: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found" });
    const io = req.app && req.app.get ? req.app.get("io") : null;
    if (io) io.emit("userDeleted", user);
    res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    next(error);
  }
}
