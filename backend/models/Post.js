const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    player: { type: String, required: true },
    playerLower: { type: String, index: true }, // ✅ 검색 최적화용 필드 추가
    imageUrl: { type: String, required: true },
    authorEmail: { type: String, default: "guest@unknown.com" },
    authorName: { type: String, default: "사용자" },
  },
  { timestamps: true }
);

// ✅ 저장 전에 playerLower 자동 세팅
PostSchema.pre("save", function (next) {
  if (this.player) {
    this.playerLower = this.player.toLowerCase();
  }
  next();
});

module.exports = mongoose.model("Post", PostSchema);
