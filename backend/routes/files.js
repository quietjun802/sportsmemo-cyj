const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

// ✅ 모든 업로드 글 가져오기
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // 최신순
    res.json(posts);
  } catch (err) {
    console.error("❌ 파일 목록 불러오기 실패:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
