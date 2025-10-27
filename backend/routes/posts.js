const express = require("express");
const Post = require("../models/Post");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware"); // ✅ 통일

// ✅ 내 피드 조회 (로그인한 사용자의 글만)
router.get("/my", verifyToken, async (req, res) => {
  try {
    console.log("🧩 내 피드 요청 user:", req.user); // ✅ 위치 이동

    const email = req.user?.email;
    if (!email) {
      console.log("⚠️ req.user.email 없음");
      return res.status(401).json({ message: "인증 실패: 이메일 정보 없음" });
    }

    const posts = await Post.find({ authorEmail: email }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ 내 피드 불러오기 실패:", err);
    res.status(500).json({ error: "내 피드 불러오기 실패" });
  }
});

// ✅ 특정 선수 이름으로 검색
router.get("/player/:name", async (req, res) => {
  try {
    const name = req.params.name.trim().toLowerCase();
    const posts = await Post.find({ playerLower: name }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ 선수별 게시글 조회 오류:", err);
    res.status(500).json({ error: "게시글 불러오기 실패" });
  }
});

// ✅ 전체 게시글 조회
router.get("/", async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ 전체 게시글 불러오기 실패:", err);
    res.status(500).json({ error: "전체 게시글 불러오기 실패" });
  }
});

module.exports = router;
