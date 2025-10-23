const express = require("express");
const Post = require("../models/Post");
const { verifyToken } = require("../middlewares/authMiddleware");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();

// ✅ S3 클라이언트
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ 전체 게시글 조회
router.get("/", async (_req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// ✅ 게시글 수정 (PUT)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, player } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    if (post.authorEmail !== req.user.email)
      return res.status(403).json({ message: "수정 권한이 없습니다." });

    post.title = title;
    post.description = description;
    post.player = player;
    await post.save();

    res.json({ message: "✅ 게시글 수정 완료", post });
  } catch (err) {
    console.error("❌ 수정 오류:", err);
    res.status(500).json({ error: "게시글 수정 실패" });
  }
});

// ✅ 게시글 삭제 (DELETE)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    if (post.authorEmail !== req.user.email)
      return res.status(403).json({ message: "삭제 권한이 없습니다." });

    // 🔹 S3 이미지 삭제
    const key = post.imageUrl.split(".amazonaws.com/")[1];
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      })
    );

    // 🔹 MongoDB에서 게시글 삭제
    await post.deleteOne();

    res.json({ message: "🗑 게시글 삭제 완료" });
  } catch (err) {
    console.error("❌ 삭제 오류:", err);
    res.status(500).json({ error: "게시글 삭제 실패" });
  }
});

module.exports = router;
