const { Schema, model } = require("mongoose");

const admin = new Schema({
  name: String,
  password: String,
  email: String,
  id: Number
});

const Admin = model("Administrator", admin);

module.exports = { Admin };
