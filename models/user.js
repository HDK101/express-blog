const { Schema, model } = require("mongoose");

const user = new Schema({
  name: String,
  password: String,
  email: String,
  id: Number
});

const User = model("User", user);

module.exports = { User };
