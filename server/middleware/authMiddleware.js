const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Extract token from header: Authorization: Bearer <token>
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret_key"
    );

    // Attach decoded user to req.user
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
