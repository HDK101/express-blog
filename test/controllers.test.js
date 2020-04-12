const {
  AdminMethods,
  PostMethods,
  LoginAnd,
} = require("../controller/controllers");
const { Admin, Post, Increment } = require("../models/models");
const { closeConnection, connect } = require("../Server/server");
const assert = require("assert");
const { getConfig } = require("../Server/configParser");

const config = getConfig();

const {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdminByToken,
  loginAdminByCredentials,
} = AdminMethods;
const { createPost, updatePost, deletePost } = PostMethods;

describe("Methods for Controllers file", () => {
  const token = "123testtoken123";
  const otherToken = "321tokentest321";
  testMainAdmin = new Admin({
    email: "test@email.com",
    name: "Name",
    password: "Password123456",
    token: token,
    main: true,
    id: 0,
  });
  testOtherAdmin = {
    email: "other@email.com",
    name: "Name1",
    password: "Password654321",
    id: 1,
  };
  testOtherUpdatedAdmin = {
    email: "another@email.com",
    name: "Name2",
    password: "Password232323",
    id: 1,
  };

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
          testMainAdmin.save(function () {
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
  it("login admin by token", (done) => {
    function testMainloginAdminByToken() {
      promise = new Promise(function (resolve) {
        loginAdminByToken(token, function (err, logged, admin) {
          if (err) reject(err);

          logged && resolve(true);
          !logged && reject(false);
        });
      });
      return promise;
    }

    testMainloginAdminByToken()
      .then(function (logged) {
        console.log("Logged? " + logged);
        assert(logged == true);
        done();
      })
      .catch(function (err) {
        assert.fail("This should not be happening! " + err);
      });
  });
  it("create admin", (done) => {
    function testCreateAdmin() {
      return createAdmin(testOtherAdmin, token);
    }

    function checkAdminExistence() {
      return Admin.findOne({ id: 1 }, function (err, admin) {
        if (err) throw err;

        console.log(admin.name, admin.password, admin.email);
        assert(admin != null);
        done();
      });
    }

    testCreateAdmin()
      .then(checkAdminExistence)
      .catch(function (err) {
        assert.fail("This should not be happening! " + err);
      });
  });
  it("update admin", (done) => {
    function testUpdateAdmin() {
      return updateAdmin(testOtherUpdatedAdmin, otherToken);
    }

    function checkAdminUpdate() {
      return Admin.findOne({ id: 1 }, function (err, admin) {
        if (err) throw err;

        const { name, email, password } = testOtherUpdatedAdmin;

        console.log(admin.name, admin.password, admin.email);

        assert(admin.name == name);
        assert(admin.email == email);
        assert(admin.password == password);
        done();
      });
    }

    loginAdminByCredentials(
      {
        email: testOtherAdmin.email,
        password: testOtherAdmin.password,
      },
      otherToken
    )
      .then(testUpdateAdmin)
      .then(checkAdminUpdate)
      .catch(function (err) {
        assert.fail("This should not be happening! " + err);
      });
  });
  it("delete admin", (done) => {
    function testDeleteAdmin() {
      return deleteAdmin(1, token);
    }

    function checkAdminExistence() {
      return Admin.findOne({ id: 1 }, function (err, admin) {
        assert(admin == null);
        done();
      });
    }

    testDeleteAdmin()
      .then(checkAdminExistence)
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

    function deleteAdmins() {
      return Admin.deleteMany({}, function (err) {
        if (err) console.log(err);

        console.log("Admins removed");
      });
    }

    deletePosts()
      .then(deleteIncrements)
      .then(deleteAdmins)
      .finally(closeConnection);
  });
});
