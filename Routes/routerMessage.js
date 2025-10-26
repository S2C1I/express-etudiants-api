import { Router } from "express";
import {
  getConversation,
  sendMessage,
  getConversations,
  markAsRead,
} from "../Controllers/controllerMessage.js";
import { tokenVerification } from "../Middleware/TokenVerification.js";

const routerMessage = Router();

// All message routes require authentication
routerMessage.use(tokenVerification);

// Get list of all conversations
routerMessage.get("/conversations", getConversations);

// Get conversation history with a specific user
routerMessage.get("/:userId", getConversation);

// Send a new message
routerMessage.post("/", sendMessage);

// Mark a message as read
routerMessage.patch("/:messageId/read", markAsRead);

export default routerMessage;
