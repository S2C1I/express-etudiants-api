import { server } from "./index.js";
import { DBConnect } from "./Model/DBConnect.js";
import dotenv from "dotenv";

// allow overriding from the environment
dotenv.config();
const PORT = process.env.PORT || 3000;

DBConnect();
server.listen(PORT, () =>
  console.log(`serveur demarrer sur :${PORT}`)
);
