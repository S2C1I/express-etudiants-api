import { Router } from "express";
import { loginUser, registerUser, getAllUsers,
    getUserById, addUser, updateUser, deleteUser
  } from "../Controllers/controllerUser.js";

const routerUser = Router();

routerUser.post("/register", registerUser);

routerUser.post("/login", loginUser);

routerUser.get("/", getAllUsers);

routerUser.get("/:id", getUserById);

routerUser.post("/", addUser);

routerUser.put("/:id", updateUser);

routerUser.delete("/:id", deleteUser);


export default routerUser;
