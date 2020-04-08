const {
  adminLoginByToken,
  createPost,
  updatePost,
  deletePost,
} = require("../controller/controllers");
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
      .finally(done);
  });
  it("login admin by token(should return true)", (done) => {
    function testAdminLoginByToken() {
      promise = new Promise(function (resolve) {
        adminLoginByToken(token, function (err, logged, admin) {
          if (err) reject(err);

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
        if (err) reject(err);

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
  it("create and delete post", (done) => {
    testPost = { title: "Testing title.", content: "Testing content." };

    var testId;

    function testCreatePost() {
      return createPost(testPost, token);
    }

    function testDeletePost(id) {
      testId = id;
      return deletePost(id, token);
    }

    function checkPost() {
      Post.findOne({ id: testId }, function (err, post) {
        if (err) reject(err);

        console.log("Post existence: " + post);

        assert(post == null);
        done();
      });
    }

    testCreatePost()
      .then(testDeletePost)
      .then(checkPost)
      .catch(function (err) {
        assert.fail("This should not be happening! " + err);
      });
  });
  it("create and update post", (done) => {
    testPost = { title: "Testing title.", content: "Testing content." };
    testUpdatedPost = { title: "Updated title.", content: "Updated content." };

    var testId;

    function testCreatePost() {
      return createPost(testPost, token);
    }

    function testUpdatePost(id) {
      testId = id;

      testUpdatedPost = Object.assign(testUpdatedPost, { id: id });
      return updatePost(testUpdatedPost, token);
    }

    function checkPost() {
      Post.findOne({ id: testId }, function (err, post) {
        if (err) reject(err);

        assert(post.title == testUpdatedPost.title);
        assert(post.content == testUpdatedPost.content);

        console.table({
          title: post.title,
          content: post.content,
          id: post.id,
        });

        assert(post.title != testPost.title);
        assert(post.content != testPost.content);

        done();
      });
    }

    testCreatePost()
      .then(testUpdatePost)
      .then(checkPost)
      .catch(function (err) {
        assert.fail("This should not be happening! " + err);
      });
  });
  after(() => {
    function deletePosts() {
      return Post.deleteMany({}, function (err) {
        if (err) console.log(err);

        console.log("Posts removed");
      });
    }

    function deleteIncrements() {
      return Increment.deleteMany({}, function (err) {
        if (err) console.log(err);

        console.log("Increments removed");
      });
    }

    deletePosts().then(deleteIncrements).finally(closeConnection);
  });
});
