const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ 토큰이 없는 경우
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "인증 토큰이 없습니다." });
    }

    const token = authHeader.split(" ")[1];

    // ✅ 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 유저 정보 전달
    req.user = decoded; // 이제 req.user.email, req.user.displayName 사용 가능

    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);

    // ✅ 만료된 토큰 처리
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "토큰이 만료되었습니다. 다시 로그인해주세요." });
    }

    // ✅ 기타 토큰 에러 처리
    res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};
