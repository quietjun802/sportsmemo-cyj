const express = require("express");
const multer = require("multer");
const path = require("path");
const Post = require("../models/Post");

const router = express.Router();

// ✅ 업로드 저장 위치 지정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ 업로드 라우트
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { title, description, player } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;
    const authorEmail = req.user?.email || "guest@unknown.com";
    const authorName = req.user?.displayName || "게스트";

    const newPost = new Post({
      title,
      description,
      player,
      imageUrl,
      authorEmail,
      authorName,
    });

    await newPost.save();

    console.log("✅ MongoDB 저장 완료:", newPost);

    res.json({
      message: "Upload success",
      post: newPost,
    });
  } catch (err) {
    console.error("❌ 업로드 오류:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
