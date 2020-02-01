const { adminLoginByToken } = require("../controller/controllers");
const { Admin } = require("../models/models");
const { connect } = require("../Server/server");
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
    id: 0
  });
  before(function(done) {
    connect(config.blogName, true);

    function adminCount() {
      promise = new Promise(function(resolve, reject) {
        Admin.countDocuments({ id: 0 }, function(err, count) {
          if (err) reject(err);
          resolve(count);
        });
      });
      return promise;
    }

    function saveAdmin(count) {
      promise = new Promise(function(resolve) {
        if (count == 0) {
          testAdmin.save(function() {
            console.log("Test admin saved!");
            resolve();
          });
        } else resolve();
      });
      return promise;
    }

    Promise.resolve()
      .then(adminCount)
      .then(saveAdmin)
      .then(function() {
        done();
      });
  });
  it("login admin by token(should return true)", done => {
    function loginByToken() {
      promise = new Promise(function(resolve) {
        adminLoginByToken(token, function(logged) {
          logged && resolve(true);
          !logged && reject(false);
        });
      });
      return promise;
    }

    Promise.resolve()
      .then(loginByToken)
      .then(function(logged) {
        console.log("Logged? " + logged);
        assert(logged == true);
        done();
      })
      .catch(function(error) {
        assert.fail("This should not be happening!");
      });
  });
});
