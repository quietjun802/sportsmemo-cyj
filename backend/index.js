const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path"); // 💡 추가

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// ✅ 미들웨어 설정
app.use(
  cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ✅ MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err.message));

// ✅ 기본 라우트
app.get("/", (_req, res) => res.send("PhotoMemo API OK"));

// ✅ Auth Routes (기존 로그인 기능)
const authRoutes = require("./routes/authroutes");
app.use("/api/auth", authRoutes);

// ✅ Upload Routes (파일 + DB 저장 기능)
const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

// ✅ File Routes (업로드된 글 목록 불러오기용)
const fileRoutes = require("./routes/files");
app.use("/api/files", fileRoutes);

// ✅ 업로드된 이미지 접근 가능하게 (정적 제공)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ 에러 핸들링 (404 or 기타 에러)
app.use((req, res) => {
  res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});
