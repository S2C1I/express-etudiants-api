import mongoose from "mongoose";
import User from "./User";

const journalSchema = new mongoose.Schema(
    {  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  actionType: {
    type: String,
    enum: ["Ajout", "Mise à jour", "Suppression", "consultation"],
    required: true,
  },
  etudiantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Etudiant",
    default: null,
  },
  ipAdress: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  } }
);


const Journal = mongoose.model("Journal", journalSchema);

export default Journal;
