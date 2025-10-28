import morgan from "morgan";
import monRouter from "./Routes/router.js";
import express from "express";
import { errorHandler } from "./Middleware/errorHandler.js";
import { NotFound } from "./Middleware/foundError.js";
import dotenv from "dotenv";
import routerUser from "./Routes/routerUser.js";
import routerMessage from "./Routes/routerMessage.js";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import routerJournal from "./Routes/routerJournal.js";

// load env as early as possible
dotenv.config();

const app = express();

// Build CORS options from environment for flexibility across dev/prod
// FRONTEND_ORIGIN can be a single origin, comma-separated list, or "*"
const rawOrigins = process.env.FRONTEND_ORIGIN || "http://localhost:4200";
const origins =
  rawOrigins === "*"
    ? "*"
    : rawOrigins
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);

const corsOptions = {
  origin: origins,
  credentials: origins === "*" ? false : true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Socket.io CORS configuration
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: origins,
    methods: ["GET", "POST"],
    credentials: origins === "*" ? false : true,
  },
});

// Expose io on the express app so controllers can access it via req.app.get('io')
app.set("io", io);

// Track online users
const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  socket.on("userOnline", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("userOnline", userId);
    socket.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("chat-message", (data) => {
    io.emit("chat-message", data);
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("userOffline", userId);
        break;
      }
    }
  });
});

app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded files statically so frontend can access them
app.use("/uploads", express.static("uploads"));

app.use("/users", routerUser);
app.use("/etudiants", monRouter);
app.use("/journal", routerJournal);
// server is created above before initializing socket.io

// Simple health and root endpoints for uptime checks and quick tests
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", time: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res
    .status(200)
    .send(
      "Express Etudiants API is running. Try /health or authenticated routes like /etudiants."
    );
});

app.use(NotFound);
app.use(errorHandler);

export { io, app, server };
