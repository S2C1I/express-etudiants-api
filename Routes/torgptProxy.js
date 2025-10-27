import express from "express";
import axios from "axios";
const router = express.Router();

// Proxy endpoint for TorGPT API
router.post("/torgpt", async (req, res) => {
  try {
    const response = await axios.post(
      "https://torgpt.space/api/v1/chat",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "TorGPT proxy error", details: error.message });
  }
});

export default router;
