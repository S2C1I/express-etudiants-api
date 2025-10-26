import mongoose from "mongoose";

// Connect to MongoDB (Atlas or local)
export async function DBConnect() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/etudiants";
  try {
    await mongoose.connect(uri);
    const sanitized = uri.replace(/:\/\/.+@/, "://***:***@");
    console.log(`MongoDB connecté -> ${sanitized}`);
  } catch (err) {
    console.error("Erreur MongoDB", err.message || err);
    throw err;
  }
}
