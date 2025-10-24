// backend/models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    player: String,
    playerLower: String,
    imageUrl: String,
    authorEmail: String,
    authorName: String,
  },
  { timestamps: true }
);

// ✅ 저장 전에 자동으로 playerLower 추가
PostSchema.pre("save", function (next) {
  if (this.player) {
    this.playerLower = this.player.toLowerCase().trim();
  }
  next();
});

module.exports = mongoose.model("Post", PostSchema);
