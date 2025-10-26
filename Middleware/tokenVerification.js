import jwt from "jsonwebtoken";

export function tokenVerification(req, res, next) {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Token manquant" });
    }

    // Extract token from "Bearer TOKEN" format
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("Token vérifié:", decoded);
    next();
  } catch (error) {
    // Handle JWT errors (expired, invalid, etc.)
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token invalide" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expiré" });
    }
    // Other errors
    return res.status(500).json({ message: "Erreur de vérification du token" });
  }
}
