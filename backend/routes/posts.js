const express = require("express");
const Post = require("../models/Post");
const router = express.Router();

// ✅ 특정 선수 이름으로 검색 (대소문자 무시) — 반드시 맨 위에 둬야 함
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

// ✅ 전체 게시글 조회 (맨 아래로 이동)
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
