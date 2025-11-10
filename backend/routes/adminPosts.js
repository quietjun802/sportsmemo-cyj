const express = require("express");
const Post = require("../models/Post");
const { verifyToken } = require("../middlewares/authMiddleware"); // ✅ verifyUser 대신 verifyToken으로 통일
const router = express.Router();

// ✅ 관리자 접근 제한
router.use(verifyToken, (req, res, next) => {
  console.log("🧩 관리자 요청 user:", req.user?.email, req.user?.role);
  if (!req.user) return res.status(401).json({ message: "로그인 필요" });
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }
  next();
});

// ✅ 게시글 전체 조회 (관리자 전용)
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ 게시글 조회 오류:", err.message);
    res.status(500).json({ message: "게시글 조회 실패" });
  }
});

// ✅ 게시글 상태 변경 (승인 / 거절)
router.patch("/posts/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "게시글 없음" });
    res.json(post);
  } catch (err) {
    console.error("❌ 게시글 상태 변경 실패:", err.message);
    res.status(500).json({ message: "게시글 상태 변경 실패" });
  }
});

// ✅ 게시글 삭제
router.delete("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "게시글 없음" });
    res.json({ message: "게시글 삭제 완료" });
  } catch (err) {
    console.error("❌ 게시글 삭제 실패:", err.message);
    res.status(500).json({ message: "게시글 삭제 실패" });
  }
});

module.exports = router;
