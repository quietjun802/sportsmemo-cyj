const express = require("express");
const multer = require("multer");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Post = require("../models/Post");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { verifyToken } = require("../middlewares/authMiddleware"); // ✅ JWT 인증 미들웨어

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

// ✅ multer 메모리 저장소 (파일을 서버 디스크에 저장하지 않음)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ 파일 업로드 + MongoDB 저장
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { title, description, player } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "파일이 없습니다." });
    }

    // 🔹 파일 이름 랜덤+시간 기반으로 고유하게 생성
    const fileName = `${Date.now()}-${crypto
      .randomBytes(8)
      .toString("hex")}${path.extname(req.file.originalname)}`;

    // 🔹 AWS S3 업로드 파라미터
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    // 🔹 실제 S3에 업로드
    await s3.send(new PutObjectCommand(uploadParams));

    // 🔹 업로드된 파일의 실제 URL
    const imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // ✅ 로그인한 사용자 정보 (JWT에서 가져오기)
    if (!req.user || !req.user.email) {
      return res.status(401).json({ error: "로그인이 필요합니다." });
    }

    const authorEmail = req.user.email;
    const authorName = req.user.displayName;

    // 🔹 MongoDB에 게시글 저장
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

    res.status(201).json({
      message: "✅ 업로드 성공 (S3 + MongoDB)",
      post: newPost,
    });
  } catch (err) {
    console.error("❌ 업로드 오류:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

module.exports = router;
