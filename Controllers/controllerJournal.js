import Journal from "../Model/journal.js";
import mongoose from "mongoose";

export async function getAllJournals(req, res, next) {
  try {
    const { userId, etudiantId } = req.query;
    const filter = {};
    if (userId && mongoose.isValidObjectId(userId)) {
      filter.userId = new mongoose.Types.ObjectId(userId);
    }
    if (etudiantId && mongoose.isValidObjectId(etudiantId)) {
      filter.etudiantId = new mongoose.Types.ObjectId(etudiantId);
    }
    const journals = await Journal.find(filter)
      .populate("userId", "prenom nom email")
      .populate("etudiantId", "nom prenom email")
      .sort({ timestamp: -1 });
    res.status(200).json(journals);
  } catch (err) {
    next(err);
  }
}

export async function addJournal(req, res, next) {
  try {
    const { actionType, etudiantId, ipAdress } = req.body;
    console.log("[Journal POST req.body]", req.body); // Log incoming payload
    const userId = req.user.id; // Use 'id' from JWT payload
    // Ensure etudiantId is a valid ObjectId or null
    let validEtudiantId = null;
    if (etudiantId && mongoose.isValidObjectId(etudiantId)) {
      validEtudiantId = new mongoose.Types.ObjectId(etudiantId);
    }
    const journal = new Journal({
      userId,
      actionType,
      etudiantId: validEtudiantId,
      ipAdress: ipAdress || req.ip,
    });
    await journal.save();
    res.status(201).json(journal);
  } catch (err) {
    next(err);
  }
}
