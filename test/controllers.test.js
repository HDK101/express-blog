const { adminLoginByToken } = require("../controller/controllers");
const { Admin } = require("../models/models");
const { connect } = require("../Server/server");
const assert = require("assert");

describe("Methods for Controllers file", () => {
  it("login admin by token(should return true)", () => {
    connect({ test: true });

    const token = "123testtoken123";
    testAdmin = new Admin({
      email: "test@email.com",
      name: "Name",
      password: "Password",
      token: token,
      main: true,
      id: 0
    });

    function saveAdmin() {
      promise = new Promise(function(resolve) {
        testAdmin.save();
        resolve();
      });
      return promise;
    }
    function loginByToken() {
      promise = new Promise(function(resolve) {
        adminLoginByToken(token, function(logged) {
          resolve(logged);
        });
      });
      return promise;
    }

    return Promise.resolve()
      .then(saveAdmin)
      .then(loginByToken)
      .then(function(logged) {
        promise = new Promise(function(resolve) {
          console.log("Logged? " + logged);
          assert(logged == true);
          resolve();
        });
      })
      .catch(function(error) {
        assert.fail("This should not be happening!");
      });
  });
  after(function() {
    Admin.collection.drop();
  });
});
