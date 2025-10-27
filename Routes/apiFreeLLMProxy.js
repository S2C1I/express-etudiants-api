import express from "express";
import axios from "axios";
const router = express.Router();

// Proxy endpoint for ApiFreeLLM
router.post("/apifreellm", async (req, res) => {
  try {
    const response = await axios.post(
      "https://apifreellm.example.com/api/v1/chat", // <-- Replace with the real ApiFreeLLM endpoint
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "ApiFreeLLM proxy error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "ApiFreeLLM API error",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
