import { Router } from "express";
import {
  addEtudiant,
  deleteEtudiant,
  getAllEtudiants,
  getEtudiantById,
  updateEtudiant,
  getTotalEtudiants,
} from "../Controllers/controller.js";
import { tokenVerification } from "../Middleware/tokenVerification.js";
import { roleVerification } from "../Middleware/roleVerification.js";
import { upload } from "../Middleware/upload.js";

const monRouter = Router();

monRouter.use(tokenVerification);

monRouter.get("/", getAllEtudiants);

monRouter.get("/total", getTotalEtudiants);

monRouter.get("/:id", getEtudiantById);

//monRouter.use(roleVerification);

monRouter.post("/", upload.single("file"), addEtudiant);

monRouter.put("/:id", updateEtudiant);

monRouter.delete("/:id", deleteEtudiant);

export default monRouter;
