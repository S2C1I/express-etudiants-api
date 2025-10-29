import Journal from "../Model/journal.js";
import mongoose from "mongoose";

// Helper: Log a journal entry after any user or etudiant edit
export async function logJournal({
  userId,
  actionType,
  etudiantId = null,
  ipAdress = null,
}) {
  try {
    let validEtudiantId = null;
    if (etudiantId && mongoose.isValidObjectId(etudiantId)) {
      validEtudiantId = new mongoose.Types.ObjectId(etudiantId);
    }
    const journal = new Journal({
      userId,
      actionType,
      etudiantId: validEtudiantId,
      ipAdress,
    });
    await journal.save();
    return journal;
  } catch (err) {
    // Optionally log error
    return null;
  }
}

// GET all journals, optionally filtered by userId or etudiantId
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
      .populate({ path: "userId", select: "prenom nom email" })
      .populate({ path: "etudiantId", select: "nom prenom email" })
      .sort({ timestamp: -1 });
    // Format for frontend: user, changed item, action, timestamp
    const formatted = journals.map((j) => ({
      user: j.userId,
      item: j.etudiantId || null,
      action: j.actionType,
      timestamp: j.timestamp,
    }));
    res.status(200).json(formatted);
  } catch (err) {
    next(err);
  }
}

// POST a new journal entry (for direct API use, e.g. notifications)
export async function addJournal(req, res, next) {
  try {
    const { actionType, etudiantId, ipAdress } = req.body;
    const userId = req.user.id;
    const journal = await logJournal({
      userId,
      actionType,
      etudiantId,
      ipAdress: ipAdress || req.ip,
    });
    res.status(201).json(journal);
  } catch (err) {
    next(err);
  }
}
