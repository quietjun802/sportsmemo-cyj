const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Post = require("../models/Post");
const { verifyToken } = require("../middlewares/authMiddleware"); // ✅ 인증 미들웨어 추가
const dotenv = require("dotenv");

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

// ✅ multer 메모리 저장소 (로컬 폴더 저장 X)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ 업로드 라우트 (로그인한 사용자만 가능)
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { title, description, player } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "파일이 없습니다." });
    }

    // 🔹 파일 이름 고유하게 생성
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(req.file.originalname)}`;

    // 🔹 S3 업로드 파라미터 설정
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    // 🔹 S3에 업로드 실행
    await s3.send(new PutObjectCommand(uploadParams));

    // 🔹 업로드된 파일의 접근 가능한 URL 생성
    const imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // 🔹 로그인한 사용자 정보 (authMiddleware에서 전달됨)
    const authorEmail = req.user.email;
    const authorName = req.user.displayName;

    // 🔹 MongoDB에 게시글 저장
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
      message: "✅ 업로드 성공 (S3 + MongoDB)",
      post: newPost,
    });
  } catch (err) {
    console.error("❌ 업로드 오류:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

module.exports = router;
