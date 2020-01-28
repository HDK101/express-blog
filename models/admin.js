const { Schema, model } = require("mongoose");

const admin = new Schema({
  name: String,
  password: String,
  email: String,
  id: Number,
  /*A boolean to check if this admin is the main one*/
  main: { type: Boolean, default: false }
});

const Admin = model("Administrator", admin);

module.exports = { Admin };
