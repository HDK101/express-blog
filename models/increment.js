const { Schema, model } = require("mongoose");

const increment = new Schema({
  post: Number,
  admin: Number,
  user: Number,
  comment: Number,
  id: String
});

const Increment = model("Increment", increment);

module.exports = { Increment };
