const express = require("express");
const Post = require("../models/Post");
const { verifyToken } = require("../middlewares/authMiddleware");
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const router = express.Router();

// ✅ S3 클라이언트 설정
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/* ------------------------------------------
   📸 전체 게시글 조회 (내 글 + 공개용)
------------------------------------------- */
router.get("/", async (_req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("❌ 게시글 조회 오류:", error);
    res.status(500).json({ message: "게시글 조회 실패" });
  }
});

/* ------------------------------------------
   🔍 선수 이름으로 전체 검색 (공개 피드용)
   ex) GET /api/files/search?player=손흥민
------------------------------------------- */
router.get("/search", async (req, res) => {
  try {
    const { player } = req.query;

    // 검색어가 없으면 빈 배열 반환
    if (!player) {
      return res.status(400).json({ message: "검색어가 필요합니다." });
    }

    // 대소문자 구분 없이 포함 검색
    const query = { player: { $regex: player, $options: "i" } };

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(posts);
  } catch (error) {
    console.error("❌ 검색 오류:", error);
    res.status(500).json({ message: "검색 실패", error: error.message });
  }
});

/* ------------------------------------------
   ✏️ 게시글 수정 (PUT)
------------------------------------------- */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { title, description, player } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    if (post.authorEmail !== req.user.email) {
      return res.status(403).json({ message: "수정 권한이 없습니다." });
    }

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

/* ------------------------------------------
   🗑 게시글 삭제 (DELETE)
------------------------------------------- */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    if (post.authorEmail !== req.user.email) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    // 🔹 S3 이미지 삭제
    if (post.imageUrl && post.imageUrl.includes("amazonaws.com/")) {
      const key = post.imageUrl.split(".amazonaws.com/")[1];
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
        })
      );
    }

    // 🔹 MongoDB에서 게시글 삭제
    await post.deleteOne();

    res.json({ message: "🗑 게시글 삭제 완료" });
  } catch (err) {
    console.error("❌ 삭제 오류:", err);
    res.status(500).json({ error: "게시글 삭제 실패" });
  }
});

module.exports = router;
