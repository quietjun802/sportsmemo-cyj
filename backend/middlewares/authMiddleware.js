const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "토큰이 없습니다. 로그인 필요" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ 여기서 email, displayName, id, role 다 들어감
    next();
  } catch (err) {
    console.error("❌ 토큰 인증 오류:", err.message);
    return res.status(403).json({ message: "토큰이 유효하지 않습니다." });
  }
};
