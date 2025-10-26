import Etudiant from "../model/Etudiant.js";

export async function getAllEtudiants(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const search = req.query.search ? req.query.search.trim() : "";

    const filter = search
      ? {
          $or: [
            { nom: { $regex: search, $options: "i" } },
            { prenom: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [etudiants, total] = await Promise.all([
      Etudiant.find(filter).skip(skip).limit(limit),
      Etudiant.countDocuments(filter),
    ]);

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: etudiants,
    });
  } catch (err) {
    next(err);
  }
}

export async function getEtudiantById(req, res, next) {
        try {
          const etudiant = await Etudiant.findOne({ id: req.params.id });
          if (!etudiant) {
            return res.status(404).json({ message: "Étudiant non trouvé" });
          }
          res.status(200).json(etudiant);
        } catch (error) {
          next(error);
        }
}

export async function addEtudiant(req, res, next) {
  try {
    const newEtudiant = new Etudiant(req.body);
    await newEtudiant.save();

    // DEBUG: Check what's in req.user
    console.log("req.user:", req.user);

    // Emit socket notification
    const io = req.app && req.app.get ? req.app.get("io") : null;
    if (io) {
      io.emit("notification", {
        action: "add",
        prenom: newEtudiant.prenom,
        nom: newEtudiant.nom,
        email: newEtudiant.email,
        matiere: newEtudiant.matiere,
        timestamp: new Date(),
        modifiedBy: req.user
          ? {
              nom: req.user.nom,
              prenom: req.user.prenom,
              email: req.user.email,
            }
          : null,
      });
    }

    res.status(200).json(newEtudiant);
  } catch (error) {
    next(error);
  }
}

export async function updateEtudiant(req, res, next) {
  try {
    const etudiant = await Etudiant.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!etudiant) {
      return res.status(404).json({ message: "Étudiant non trouvé" });
    }

    // Emit socket notification
    const io = req.app && req.app.get ? req.app.get("io") : null;
    if (io) {
      io.emit("notification", {
        action: "update",
        prenom: etudiant.prenom,
        nom: etudiant.nom,
        email: etudiant.email,
        matiere: etudiant.matiere,
        timestamp: new Date(),
        modifiedBy: req.user
          ? {
              nom: req.user.nom,
              prenom: req.user.prenom,
              email: req.user.email,
            }
          : null,
      });
    }

    res.status(200).json(etudiant);
  } catch (error) {
    next(error);
  }
}

export async function deleteEtudiant(req, res, next) {
  try {
    const etudiant = await Etudiant.findOneAndDelete({ id: req.params.id });

    if (!etudiant) {
      return res.status(404).json({ message: "Étudiant non trouvé" });
    }

    // Emit socket notification
    const io = req.app && req.app.get ? req.app.get("io") : null;
    if (io) {
      io.emit("notification", {
        action: "delete",
        prenom: etudiant.prenom,
        nom: etudiant.nom,
        email: etudiant.email,
        matiere: etudiant.matiere,
        timestamp: new Date(),
        modifiedBy: req.user
          ? {
              nom: req.user.nom,
              prenom: req.user.prenom,
              email: req.user.email,
            }
          : null,
      });
    }

    res
      .status(200)
      .json({ message: "Étudiant supprimé avec succès", etudiant });
  } catch (error) {
    next(error);
  }
}

export async function getTotalEtudiants(_req, res, next) {
  try {
    const total = await Etudiant.countDocuments();
    res.status(200).json({ total });
  } catch (error) {
    next(error);
  }
}
