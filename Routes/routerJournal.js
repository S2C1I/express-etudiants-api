import { Router } from "express";
import { getAllJournals, addJournal } from "../Controllers/controllerJournal.js";
import { tokenVerification } from "../Middleware/tokenVerification.js";

const routerJournal = Router();

// All journal routes require authentication
routerJournal.use(tokenVerification);

routerJournal.get("/", getAllJournals);
routerJournal.post("/", addJournal);

export default routerJournal;
