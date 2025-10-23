// backend/models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    player: { type: String, required: true },
    imageUrl: { type: String, required: true },
    authorEmail: { type: String, default: "guest@unknown.com" },
    authorName: { type: String, default: "사용자" },
  },
  { timestamps: true } // ✅ createdAt, updatedAt 자동 생성
);

module.exports = mongoose.model("Post", PostSchema);
