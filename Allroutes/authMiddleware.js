// routes/authMiddleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = "auth-token"; // replace with env var in production

export function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "authorization token missing" });
    }

    // Verify token; throws if invalid/expired
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach decoded payload to request (example: { number })
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "token expired" });
    }
    return res.status(401).json({ message: "invalid token" });
  }
}
