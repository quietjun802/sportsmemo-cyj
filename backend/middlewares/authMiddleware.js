const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // ✅ 이제 req.user.email, req.user.displayName 사용 가능
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
