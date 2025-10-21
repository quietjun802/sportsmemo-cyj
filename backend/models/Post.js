const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  player: { type: String },
  imageUrl: { type: String },
  authorEmail: { type: String },
  authorName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);