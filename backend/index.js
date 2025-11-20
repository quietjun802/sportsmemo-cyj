const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const FRONT_ORIGIN = process.env.FRONT_ORIGIN || "http://localhost:5173";
console.log("🚀 FRONT_ORIGIN:", FRONT_ORIGIN);

// ✅ CORS (allowedHeaders 제거)
app.use(
  cors({
    origin: FRONT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ✅ OPTIONS 프리플라이트 수동 처리 (여기에 allowedHeaders 명시)
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", FRONT_ORIGIN);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(200);
});

// ✅ 모든 응답에 쿠키 허용
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONT_ORIGIN);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// 쿠키 디버깅
app.use((req, _res, next) => {
  console.log("🍪 Cookies:", req.cookies);
  next();
});

// DB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB 연결 성공"))
  .catch((err) => console.error("❌ MongoDB 연결 실패:", err.message));

// 라우트
app.get("/", (_req, res) => res.send("📸 PhotoMemo API OK"));
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/files", require("./routes/files"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/admin", require("./routes/adminPosts"));

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ message: "요청한 API를 찾을 수 없습니다." });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Allow-Origin: ${FRONT_ORIGIN}`);
});
