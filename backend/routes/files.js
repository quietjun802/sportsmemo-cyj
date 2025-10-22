const express = require("express");
const Post = require("../models/Post");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { verifyToken } = require("../middlewares/authMiddleware"); // ✅ 추가

const router = express.Router();

// ✅ S3 설정
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ 게시글 목록
router.get("/", async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "DB 조회 실패" });
  }
});

// ✅ 게시글 수정 (본인만 가능)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, player } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "게시글 없음" });
    if (post.authorEmail !== req.user.email)
      return res.status(403).json({ message: "본인 글만 수정 가능합니다." });

    post.title = title;
    post.description = description;
    post.player = player;
    await post.save();

    res.json({ message: "✅ 수정 완료", post });
  } catch (err) {
    res.status(500).json({ error: "수정 실패" });
  }
});

// ✅ 게시글 삭제 (본인만 가능)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "게시글 없음" });
    if (post.authorEmail !== req.user.email)
      return res.status(403).json({ message: "본인 글만 삭제 가능합니다." });

    const key = post.imageUrl.split(".amazonaws.com/")[1];
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ 삭제 완료" });
  } catch (err) {
    res.status(500).json({ error: "삭제 실패" });
  }
});

module.exports = router;
