import Journal from "../Model/journal.js";

export async function getAllJournals(req, res, next) {
  try {
    const { userId, etudiantId } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (etudiantId) filter.etudiantId = etudiantId;
    const journals = await Journal.find(filter)
      .populate("userId", "prenom nom email")
      .populate("etudiantId", "nom prenom email")
      .sort({ timestamp: -1 });
    res.status(200).json(journals);
  } catch (err) {
    next(err);
  }
}

export async function getJournalById(req, res, next) {
  try {
    const journal = await Journal.findById(req.params.id)
      .populate("userId", "prenom nom email")
      .populate("etudiantId", "nom prenom email");
    if (!journal) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    res.status(200).json(journal);
  } catch (err) {
    next(err);
  }
}

export async function addJournal(req, res, next) {
  try {
    const { actionType, etudiantId, ipAdress } = req.body;
    const userId = req.user._id;
    const journal = new Journal({
      userId,
      actionType,
      etudiantId: etudiantId || null,
      ipAdress: ipAdress || req.ip,
    });
    await journal.save();
    res.status(201).json(journal);
  } catch (err) {
    next(err);
  }
}

export async function updateJournal(req, res, next) {
  try {
    const updateData = req.body;
    const journal = await Journal.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!journal) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    res.status(200).json(journal);
  } catch (err) {
    next(err);
  }
}

export async function deleteJournal(req, res, next) {
  try {
    const journal = await Journal.findByIdAndDelete(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: "Journal entry not found" });
    }
    res.status(200).json({ message: "Journal entry deleted", journal });
  } catch (err) {
    next(err);
  }
}
