const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 프론트엔드 주소 (Cloudtype .env 에 반드시 설정)
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || "http://localhost:5173";

console.log("🚀 FRONT_ORIGIN 설정됨:", FRONT_ORIGIN);

// ✅ CORS 설정 - 쿠키 포함 + 올바른 Origin
app.use(
  cors({
    origin: FRONT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 CORS preflight OPTIONS 수동 처리 (쿠키 전송 문제 해결)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", FRONT_ORIGIN);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

// 🔥 반드시 필요 — 브라우저에게 쿠키 허용 선언
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONT_ORIGIN);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// 요청 파서
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// 디버그 로그 — 쿠키가 실제로 전달되는지 확인
app.use((req, _res, next) => {
  console.log("🍪 요청 쿠키:", req.cookies);
  next();
});

// MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err.message));

// 기본 라우트
app.get("/", (_req, res) => res.send("📸 PhotoMemo API OK"));

// Auth Routes
const authRoutes = require("./routes/authroutes");
app.use("/api/auth", authRoutes);

// Upload
const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// Files
const fileRoutes = require("./routes/files");
app.use("/api/files", fileRoutes);

// Posts
const postRoutes = require("./routes/posts");
app.use("/api/posts", postRoutes);

// Admin
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const adminPostRoutes = require("./routes/adminPosts");
app.use("/api/admin", adminPostRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS Origin 허용됨: ${FRONT_ORIGIN}`);
});
