const { Schema, model } = require("mongoose");

const post = new Schema({
  title: String,
  content: String,
  id: Number,
  adminId: Number
});

const Post = model("Post", post);

module.exports = { Post };
