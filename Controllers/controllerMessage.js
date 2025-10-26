import Message from "../Model/Message.js";
import User from "../Model/User.js";
import Etudiant from "../model/Etudiant.js";

// GET /messages/:userId - Get conversation history between logged-in user and another user
export async function getConversation(req, res, next) {
  try {
    const { userId } = req.params;
    let { userModel } = req.query; // 'User' or 'Etudiant' (optional)

    const loggedInUserId = req.user.id;
    const loggedInUserModel = req.user.userModel; // should be set in token

    // If userModel not provided, try to auto-detect by checking both collections
    if (!userModel) {
      const isUser = await User.findById(userId);
      if (isUser) {
        userModel = "User";
      } else {
        const isEtudiant = await Etudiant.findById(userId);
        if (isEtudiant) {
          userModel = "Etudiant";
        } else {
          return res.status(404).json({ message: "User not found" });
        }
      }
    } else if (!["User", "Etudiant"].includes(userModel)) {
      return res
        .status(400)
        .json({ message: "userModel must be User or Etudiant" });
    }

    // Find all messages between these two users (in both directions)
    const messages = await Message.find({
      $or: [
        {
          sender: loggedInUserId,
          senderModel: loggedInUserModel,
          recipient: userId,
          recipientModel: userModel,
        },
        {
          sender: userId,
          senderModel: userModel,
          recipient: loggedInUserId,
          recipientModel: loggedInUserModel,
        },
      ],
    })
      .populate("sender", "prenom nom email")
      .populate("recipient", "prenom nom email")
      .sort({ createdAt: 1 }); // ascending order

    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
}

// POST /messages - Send a new message
export async function sendMessage(req, res, next) {
  try {
    let { recipientId, recipientModel, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({
        message: "recipientId and content are required",
      });
    }

    // If recipientModel not provided, auto-detect
    if (!recipientModel) {
      const isUser = await User.findById(recipientId);
      if (isUser) {
        recipientModel = "User";
      } else {
        const isEtudiant = await Etudiant.findById(recipientId);
        if (isEtudiant) {
          recipientModel = "Etudiant";
        } else {
          return res.status(404).json({ message: "Recipient not found" });
        }
      }
    } else if (!["User", "Etudiant"].includes(recipientModel)) {
      return res
        .status(400)
        .json({ message: "recipientModel must be User or Etudiant" });
    }

    const loggedInUserId = req.user.id;
    const loggedInUserModel = req.user.userModel; // from JWT

    // Create and save the message
    const newMessage = new Message({
      sender: loggedInUserId,
      senderModel: loggedInUserModel,
      recipient: recipientId,
      recipientModel: recipientModel,
      content: content.trim(),
    });

    await newMessage.save();

    // Populate sender and recipient for the response and socket emit
    await newMessage.populate("sender", "prenom nom email");
    await newMessage.populate("recipient", "prenom nom email");

    // Emit socket event
    const io = req.app && req.app.get ? req.app.get("io") : null;
    if (io) {
      io.emit("newMessage", {
        _id: newMessage._id,
        sender: {
          _id: newMessage.sender._id,
          prenom: newMessage.sender.prenom,
          nom: newMessage.sender.nom,
          email: newMessage.sender.email,
        },
        recipient: {
          _id: newMessage.recipient._id,
          prenom: newMessage.recipient.prenom,
          nom: newMessage.recipient.nom,
          email: newMessage.recipient.email,
        },
        content: newMessage.content,
        timestamp: newMessage.createdAt,
        read: newMessage.read,
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
}

// GET /messages/conversations - Get list of all conversations (unique chat partners)
export async function getConversations(req, res, next) {
  try {
    const loggedInUserId = req.user.id;
    const loggedInUserModel = req.user.userModel;

    // Find all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: loggedInUserId, senderModel: loggedInUserModel },
        { recipient: loggedInUserId, recipientModel: loggedInUserModel },
      ],
    })
      .populate("sender", "prenom nom email")
      .populate("recipient", "prenom nom email")
      .sort({ createdAt: -1 }); // newest first

    // Group by conversation partner
    const conversationsMap = new Map();

    for (const msg of messages) {
      // Determine who the "other person" is
      const isUserSender = msg.sender._id.toString() === loggedInUserId;
      const otherPerson = isUserSender ? msg.recipient : msg.sender;
      const otherPersonId = otherPerson._id.toString();

      if (!conversationsMap.has(otherPersonId)) {
        // Count unread messages from this person
        const unreadCount = await Message.countDocuments({
          sender: otherPerson._id,
          recipient: loggedInUserId,
          read: false,
        });

        conversationsMap.set(otherPersonId, {
          user: {
            _id: otherPerson._id,
            prenom: otherPerson.prenom,
            nom: otherPerson.nom,
            email: otherPerson.email,
          },
          lastMessage: {
            content: msg.content,
            timestamp: msg.createdAt,
            from: isUserSender ? "me" : "them",
          },
          unreadCount,
        });
      }
    }

    // Convert map to array
    const conversations = Array.from(conversationsMap.values());

    res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
}

// PATCH /messages/:messageId/read - Mark a message as read
export async function markAsRead(req, res, next) {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    )
      .populate("sender", "prenom nom email")
      .populate("recipient", "prenom nom email");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
}
