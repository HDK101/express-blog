const { Schema, model } = require("mongoose");

const increment = new Schema({
  post: { type: Number, default: 0},
  admin: { type: Number, default: 0},
  user: { type: Number, default: 0},
  comment: { type: Number, default: 0},
  id: { type: String, default: 0},
});

const Increment = model("Increment", increment);

module.exports = { Increment };
