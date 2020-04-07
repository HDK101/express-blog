const { adminLoginByToken, createPost } = require("../controller/controllers");
const { Admin, Post, Increment } = require("../models/models");
const { closeConnection, connect } = require("../Server/server");
const assert = require("assert");
const { getConfig } = require("../Server/configParser");

const config = getConfig();

describe("Methods for Controllers file", () => {
  const token = "123testtoken123";
  testAdmin = new Admin({
    email: "test@email.com",
    name: "Name",
    password: "Password",
    token: token,
    main: true,
    id: 0,
  });
  before(function (done) {
    connect(config.blogName, true);

    function adminCount() {
      promise = new Promise(function (resolve, reject) {
        Admin.countDocuments({ id: 0 }, function (err, count) {
          if (err) reject(err);
          resolve(count);
        });
      });
      return promise;
    }

    function saveAdmin(count) {
      promise = new Promise(function (resolve) {
        if (count == 0) {
          testAdmin.save(function () {
            console.log("Test admin saved!");
            resolve();
          });
        } else resolve();
      });
      return promise;
    }

    function createIncrement() {
      promise = new Promise(function (resolve, reject) {
        incrementDb = new Increment();
        incrementDb.save(function (err) {
          if (err) reject(err);
          console.log("Increment created!");
          resolve();
        });
      });
      return promise;
    }

    Promise.resolve()
      .then(adminCount)
      .then(saveAdmin)
      .then(createIncrement)
      .then(function () {
        done();
      });
  });
  it("login admin by token(should return true)", (done) => {
    function testAdminLoginByToken() {
      promise = new Promise(function (resolve) {
        adminLoginByToken(token, function (err, logged, admin) {
          if (err) throw err;

          logged && resolve(true);
          !logged && reject(false);
        });
      });
      return promise;
    }

    testAdminLoginByToken()
      .then(function (logged) {
        console.log("Logged? " + logged);
        assert(logged == true);
        done();
      })
      .catch(function (err) {
        assert.fail("This should not be happening! " + err);
      });
  });
  it("create and return post", (done) => {
    testPost = { title: "Testing title.", content: "Testing content." };

    function testCreatePost() {
      return createPost(testPost, token);
    }

    function checkPost(id) {
      Post.findOne({ id: id }, function (err, post) {
        if (err) console.log(err);

        assert(post.title == testPost.title);
        assert(post.content == testPost.content);
        done();
      });
    }

    testCreatePost()
      .then(checkPost)
      .catch(function () {
        assert.fail("This should not be happening! " + err);
      });
  });
  after(() => {
    closeConnection();
  });
});
