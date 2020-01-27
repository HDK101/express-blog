const { Schema, model } = require("mongoose");

const comment = new Schema({
  content: String,
  id: Number,
  postId: Number,
  userId: Number
});

const Comment = model("Comment", comment);

module.exports = { Comment };
