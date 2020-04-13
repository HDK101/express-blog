const { Schema, model } = require("mongoose");
const { encrypt } = require("../components/crypto");
const { config } = require("../Server/server");

let secretKey = config.secretKey;

function setSecretKey(key) {
  secretKey = key;
}

/*Admin model*/
const admin = new Schema({
  name: {
    type: String,
    minlength: [4, "Name too short."],
  },
  password: {
    type: String,
    minlength: [8, "Password too short."],
    maxlength: [20, "Password too long."],
  },
  email: {
    type: String,
    validate: {
      validator: function (v) {
        const at = RegExp("@");
        return at.test(v);
      },
      message: "Email is not valid.",
    },
  },
  id: Number,
  token: String,
  /*A boolean to check if this admin is the main one*/
  main: { type: Boolean, default: false },
});

admin.pre("save", function (next) {
  if (this.password) this.password = encrypt(this.password, secretKey);
  next();
});

const Admin = model("Administrator", admin);

/*User model*/
const user = new Schema({
  name: String,
  password: String,
  email: String,
  id: Number,
});

const User = model("User", user);

/*Post*/
const post = new Schema({
  title: { type: String, required: [true, "Empty title."] },
  content: { type: String, required: [true, "Empty content."] },
  id: { type: Number, required: true },
  adminId: { type: Number, required: true },
});

const Post = model("Post", post);

/*Comment*/
const comment = new Schema({
  content: String,
  id: Number,
  postId: Number,
  userId: Number,
});

const Comment = model("Comment", comment);

/*Increment*/
const increment = new Schema({
  post: { type: Number, default: 0 },
  admin: { type: Number, default: 0 },
  user: { type: Number, default: 0 },
  comment: { type: Number, default: 0 },
  id: { type: String, default: "increment" },
});

const Increment = model("Increment", increment);

module.exports = { Admin, User, Post, Comment, Increment, setSecretKey };
