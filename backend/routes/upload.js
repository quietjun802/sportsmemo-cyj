const express = require("express");
const multer = require("multer");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Post = require("../models/Post");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { verifyToken } = require("../middlewares/authMiddleware"); // ✅ 추가

dotenv.config();

const router = express.Router();

// ✅ AWS S3 클라이언트 설정
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ multer 메모리 저장소
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ 업로드 라우트
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { title, description, player } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "파일이 없습니다." });
    }

    // 🔹 파일 이름 고유하게 생성
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(req.file.originalname)}`;

    // 🔹 S3 업로드
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    await s3.send(new PutObjectCommand(uploadParams));

    // 🔹 업로드된 파일 URL
    const imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // 🔹 로그인 유저 정보 활용
    const authorEmail = req.user.email;
    const authorName = req.user.displayName;

    // 🔹 MongoDB 저장
    const newPost = new Post({
      title,
      description,
      player,
      playerLower: player.toLowerCase().trim(),
      imageUrl,
      authorEmail,
      authorName,
    });

    await newPost.save();
    console.log("✅ MongoDB 저장 완료:", newPost);

    res.json({
      message: "✅ 업로드 성공 (S3 + MongoDB)",
      post: newPost,
    });
  } catch (err) {
    console.error("❌ 업로드 오류:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
