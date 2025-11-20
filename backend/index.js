const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 프론트엔드 주소 (환경변수 없을 경우 대비)
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || "http://localhost:5173";

// ✅ 미들웨어 — 쿠키 전송 허용
app.use(
  cors({
    origin: FRONT_ORIGIN,
    credentials: true, // ✅ 반드시 true로 설정해야 쿠키 전송 가능
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ 요청 파서
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// ✅ 디버그 로그 (요청마다 쿠키 확인)
app.use((req, _res, next) => {
  console.log("🍪 현재 요청 쿠키:", req.cookies);
  next();
});

// ✅ MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err.message));

// ✅ 기본 라우트
app.get("/", (_req, res) => res.send("📸 PhotoMemo API OK"));

// ✅ Auth Routes (로그인 / 회원가입)
const authRoutes = require("./routes/authroutes");
app.use("/api/auth", authRoutes);

// ✅ Upload Routes (S3 업로드 + MongoDB 저장)
const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// ✅ File Routes (업로드된 게시물 목록)
const fileRoutes = require("./routes/files");
app.use("/api/files", fileRoutes);

// ✅ Post Routes (검색용)
const postRoutes = require("./routes/posts");
app.use("/api/posts", postRoutes);

// ✅ Admin Routes (관리자 전용)
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);
// ✅ Admin File Routes (관리자 전용)
const adminPostRoutes = require("./routes/adminPosts");
app.use("/api/admin", adminPostRoutes);

// ⚠️ 로컬 uploads 폴더는 이제 사용하지 않음
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 404 핸들러 (맨 마지막)
app.use((req, res) => {
  res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
  console.log(`✅ CORS Origin: ${FRONT_ORIGIN}`);
});

