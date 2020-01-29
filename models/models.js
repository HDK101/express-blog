const { Schema, model } = require("mongoose");

/*Admin model*/
const admin = new Schema({
  name: String,
  password: String,
  email: String,
  id: Number,
  token : String,
  /*A boolean to check if this admin is the main one*/
  main: { type: Boolean, default: false }
});

const Admin = model("Administrator", admin);

/*User model*/
const user = new Schema({
  name: String,
  password: String,
  email: String,
  id: Number
});

const User = model("User", user);

/*Post*/
const post = new Schema({
  title: String,
  content: String,
  id: Number,
  adminId: Number
});

const Post = model("Post", post);

/*Comment*/
const comment = new Schema({
  content: String,
  id: Number,
  postId: Number,
  userId: Number
});

const Comment = model("Comment", comment);

/*Increment*/
const increment = new Schema({
  post: { type: Number, default: 0 },
  admin: { type: Number, default: 0 },
  user: { type: Number, default: 0 },
  comment: { type: Number, default: 0 },
  id: { type: String, default: "increment" }
});

const Increment = model("Increment", increment);

module.exports = { Admin, User, Post, Comment, Increment };

