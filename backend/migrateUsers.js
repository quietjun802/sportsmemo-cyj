// backend/migrateUsers.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const oldURI = "mongodb+srv://admin123:1234@cluster0.s33upz8.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";
const newURI = "mongodb+srv://admin123:1234@cluster0.s33upz8.mongodb.net/photomemo?retryWrites=true&w=majority&appName=Cluster0";

// ✅ User 스키마 복사 (models/User.js와 동일하게)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String },
  role: { type: String, default: "user" },
  isActive: { type: Boolean, default: true },
  isLoggedin: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ✅ 두 개의 mongoose 연결 생성
const oldConn = mongoose.createConnection(oldURI);
const newConn = mongoose.createConnection(newURI);

const OldUser = oldConn.model("User", userSchema, "users");
const NewUser = newConn.model("User", userSchema, "users");

(async () => {
  try {
    await oldConn.asPromise();
    await newConn.asPromise();

    console.log("✅ 두 DB 연결 완료. 데이터 복사 중...");

    const users = await OldUser.find();
    if (users.length === 0) {
      console.log("⚠ 기존 DB에 유저 데이터가 없습니다.");
      process.exit(0);
    }

    await NewUser.insertMany(users);
    console.log(`🎉 ${users.length}명의 유저 데이터가 photomemo DB로 복사되었습니다.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ 마이그레이션 중 오류:", err);
    process.exit(1);
  }
})();
