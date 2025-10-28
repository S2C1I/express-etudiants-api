import { Router } from "express";
import {
  getAllJournals,
  getJournalById,
  addJournal,
  updateJournal,
  deleteJournal,
} from "../Controllers/controllerJournal.js";
import { tokenVerification } from "../Middleware/tokenVerification.js";

const routerJournal = Router();

// All journal routes require authentication
routerJournal.use(tokenVerification);

routerJournal.get("/", getAllJournals);
routerJournal.get("/:id", getJournalById);
routerJournal.post("/", addJournal);
routerJournal.put("/:id", updateJournal);
routerJournal.delete("/:id", deleteJournal);

export default routerJournal;
