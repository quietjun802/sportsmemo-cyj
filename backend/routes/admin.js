const express = require("express");
const User = require("../models/User"); // ✅ 구조분해 제거 (User is not defined 방지)
const { verifyUser } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ 관리자 접근 전용 미들웨어
router.use(verifyUser, (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }
  next();
});

// ✅ 전체 사용자 조회
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ 사용자 조회 오류:", err.message);
    res.status(500).json({ message: "사용자 조회 실패" });
  }
});

// ✅ 관리자 지정 / 해제
router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "사용자 없음" });
    res.json(user);
  } catch (err) {
    console.error("❌ 권한 변경 실패:", err.message);
    res.status(500).json({ message: "권한 변경 실패" });
  }
});

// ✅ 계정 활성화 / 비활성화
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "사용자 없음" });
    res.json(user);
  } catch (err) {
    console.error("❌ 계정 상태 변경 실패:", err.message);
    res.status(500).json({ message: "계정 상태 변경 실패" });
  }
});

module.exports = router;
