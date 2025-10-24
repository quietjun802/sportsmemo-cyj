const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path"); // ✅ 이거 한 줄 추가 (혹시 나중에 로컬 접근 시 필요)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 미들웨어 설정
app.use(
  cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

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

// ✅ File Routes (업로드된 게시물 목록 불러오기)
const fileRoutes = require("./routes/files");
app.use("/api/files", fileRoutes);

// ⚠️ 로컬 uploads 폴더는 이제 사용하지 않으므로 주석 처리
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 에러 핸들링 (404 or 기타 에러)
app.use((req, res) => {
  res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});

const postRoutes = require("./routes/posts");
app.use("/api/posts", postRoutes);
