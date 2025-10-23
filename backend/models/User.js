const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, "유효한 이메일"],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isLoggined: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ 비밀번호 비교 메서드
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// ✅ 프론트로 보낼 안전한 JSON (수정 완료)
userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    email: this.email,             // ✅ 프론트에서 권한 비교용
    displayName: this.displayName, // ✅ 작성자 이름 표시용
    role: this.role,
    isActive: this.isActive,
    isLoggined: this.isLoggined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// ✅ 이메일 중복 방지
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
