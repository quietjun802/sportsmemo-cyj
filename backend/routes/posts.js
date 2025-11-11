const express = require("express");
const Post = require("../models/Post");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth"); // ✅ 인증 미들웨어

// ✅ 내 피드 조회 (로그인한 사용자만)
router.get("/my", authenticateToken, async (req, res) => {
  try {
    console.log("🧩 내 피드 요청 user:", req.user);
    const email = req.user?.email;
    if (!email) return res.status(401).json({ message: "로그인 필요" });

    const posts = await Post.find({ authorEmail: email }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ 내 피드 조회 오류:", err);
    res.status(500).json({ error: "내 피드 불러오기 실패" });
  }
});

// ✅ 특정 게시글 조회 (상세 페이지)
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }
    res.json(post);
  } catch (err) {
    console.error("❌ 게시글 조회 오류:", err);
    res.status(500).json({ error: "게시글 불러오기 실패" });
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
