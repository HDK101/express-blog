var { encrypt } = require("../components/crypto");
const { Increment, Admin, Post } = require("../models/models");
const { config } = require("../Server/server");

const secretKey = config.secretKey;

/*
GET
*/
function getController(app) {
  const { deleteAdmin } = AdminMethods;

  app.get("/", function (req, res) {
    postsPage(res);
  });

  /*********
  BLOG POST
  *********/
  app.get("/posts", function (req, res) {
    postsPage(res);
  });

  function postsPage(res) {
    Post.find().exec(function (err, docs) {
      if (err) return console.log(err);

      function getAdminNames() {
        promise = new Promise(function (resolve, reject) {
          Admin.find(function (error, admins) {
            if (error) reject(error);

            adminNames = new Array(100);

            adminsLength = admins.length;
            index = 0;

            for (index = 0; index < adminsLength; index++) {
              adminNames.splice(admins[index].id, 0, admins[index].name);
            }

            resolve(adminNames);
          });
        });
        return promise;
      }

      function showPosts(admins) {
        promise = new Promise(function (resolve, reject) {
          let posts = [];

          index = 0;
          docsLength = docs.length;

          for (index = 0; index < docsLength; index++) {
            let reverseIndex = docsLength - index - 1;

            let post = {
              title: docs[reverseIndex].title,
              content: docs[reverseIndex].content,
              admin: admins[docs[reverseIndex].adminId],
              id: docs[reverseIndex].id,
            };

            posts.push(post);
          }

          res.render("posts/feed", { posts: posts });

          resolve();
        });
        return promise;
      }

      getAdminNames().then(showPosts);
    });
  }

  app.get("/posts/create", function (req, res) {
    res.render("posts/create");
  });
  app.get("/posts/:id", function (req, res) {
    res.header("Cache-Control", "no-cache");
    const id = req.params.id;

    Post.findOne({ id: id }, function (err, post) {
      if (err) return console.log(err);

      if (post) {
        res.render("posts/read", {
          post: post,
          id: id,
        });
      } else {
        res.send("Post not found!");
      }
    });
  });
  app.get("/posts/:id/update", function (req, res) {
    const id = req.params.id;
    Post.findOne({ id: id }, function (err, post) {
      if (err) return console.log(err);

      if (post) {
        res.render("posts/update", {
          title: post.title,
          content: post.content,
          id: post.id,
        });
      } else {
        res.send("Post not found!");
      }
    });
  });
  app.get("/posts/:id/delete", function (req, res) {
    const id = req.params.id;
    res.render("posts/delete", {
      id: id,
    });
  });
  /****
  ADMIN
  ****/

  app.get("/admin/create", function (req, res) {
    const token = req.signedCookies.token;

    const { checkMainAdmin } = LoginAnd;

    checkMainAdmin(token)
      .then(function () {
        res.render("admin/create");
      })
      .catch(function (error) {
        handleErrors(error, res);
      });
  });

  app.get("/admin/update", function (req, res) {
    const token = req.signedCookies.token;

    const { checkLoggedAdmin } = LoginAnd;

    checkLoggedAdmin(token).then(function (admin) {
      extractedAdmin = { name: admin.name, email: admin.email };

      res.render("admin/update", { admin: extractedAdmin });
    });
  });

  app.get("/admin/delete", function (req, res) {
    var admins = [];

    const token = req.signedCookies.token;

    const { checkMainAdmin } = LoginAnd;

    function findAdmins() {
      promise = new Promise(function (resolve, reject) {
        Admin.find({}, function (err, queryAdmins) {
          if (err) reject(err);

          index = 0;
          adminsLength = queryAdmins.length;

          for (index = 0; index < adminsLength; index++) {
            if (queryAdmins[index].id != 0) {
              admin = {
                name: queryAdmins[index].name,
                id: queryAdmins[index].id,
              };
              admins.push(admin);
            }
          }

          resolve();
        });
      });
      return promise;
    }

    checkMainAdmin(token)
      .then(findAdmins)
      .then(function () {
        res.render("admin/delete", { admins: admins });
      })
      .catch(function (error) {
        handleErrors(error, res);
      });
  });

  app.get("/admin/login", function (req, res) {
    res.render("admin/login");
  });

  /******** 
  DASHBOARD
  ********/

  app.get("/dashboard", function (req, res) {
    var loggedAdmin = {};
    var adminPosts = [];

    const { loginAdminByToken } = AdminMethods;

    function loginByToken() {
      promise = new Promise(function (resolve, reject) {
        loginAdminByToken(req.signedCookies.token, function (
          err,
          logged,
          admin
        ) {
          if (err) reject(err);

          loggedAdmin = admin;

          if (logged) resolve();
          else reject("Permission denied.");
        });
      });
      return promise;
    }

    function getPosts() {
      promise = new Promise(function (resolve, reject) {
        Post.find({ adminId: loggedAdmin.id }, function (err, docs) {
          if (err) reject(err);

          docsLength = docs.length;

          for (index = 0; index < docsLength; index++) {
            let reverseIndex = docsLength - index - 1;

            let post = {
              title: docs[reverseIndex].title,
              content: docs[reverseIndex].content,
              id: docs[reverseIndex].id,
            };

            adminPosts.push(post);
          }

          resolve();
        });
      });
      return promise;
    }

    loginByToken()
      .then(getPosts)
      .then(function () {
        const { main, id } = loggedAdmin;

        res.render("dashboard/dashboard", {
          main: main,
          id: id,
          posts: adminPosts,
        });
      })
      .catch(function (error) {
        handleErrors(error, res);
      });
  });
}

/*
POST
*/
function postController(app) {
  const { createAdmin, updateAdmin, deleteAdmin } = AdminMethods;
  const { createPost, updatePost, deletePost } = PostMethods;

  /********
  BLOG POST
  ********/
  app.post("/posts/create", function (req, res) {
    const token = req.signedCookies.token;

    createPost(req.body, token)
      .then(function (id) {
        res.status(304).redirect("/posts/" + id);
      })
      .catch(function (error) {
        handleErrors(error, res);
      });
  });

  app.post("/posts/update", function (req, res) {
    const { id } = req.body;

    const token = req.signedCookies.token;

    updatePost(req.body, token)
      .then(function () {
        res.status(304).redirect("/posts/" + id);
      })
      .catch(function (error) {
        handleErrors(error, res);
      });
  });

  app.post("/posts/:id/delete", function (req, res) {
    const id = req.params.id;
    const token = req.signedCookies.token;

    deletePost(id, token)
      .then(function () {
        res.status(304).redirect("/");
      })
      .catch(function (error) {
        handleErrors(error, res);
      });
  });

  /****
  ADMIN
  ****/

  app.post("/admin/create", function (req, res) {
    const token = req.signedCookies.token;

    createAdmin(req.body, token)
      .then(function () {
        res.status(304).redirect("/");
      })
      .catch(function (error) {
        handleErrors(error, res);
      });
  });

  app.post("/admin/login", function (req, res) {
    let credentials = req.body;
    const { email, password } = credentials;

    const { loginAdminByCredentials } = AdminMethods;

    /*Generate unique and random string*/
    const token = encrypt(`${Math.random() * 1000}${email}`, secretKey);
    credentials.password = encrypt(password, secretKey);

    function setBrowserToken(adminFound) {
      promise = new Promise(function (resolve, reject) {
        if (adminFound) {
          res.cookie("token", token, { signed: true });
          resolve(true);
        } else resolve(false);
      });
      return promise;
    }

    function redirectOrError(cookieDone) {
      promise = new Promise(function (resolve, reject) {
        if (cookieDone) res.status(304).redirect("/");
        else {
          const errorMessage = "Invalid credentials!";
          reject(errorMessage);
        }
        resolve();
      });
      return promise;
    }

    loginAdminByCredentials(credentials, token)
      .then(setBrowserToken)
      .then(redirectOrError)
      .catch(function (error) {
        handleErrors(error, res);
      });
  });

  app.post("/admin/update", function (req, res) {
    const token = req.signedCookies.token;
    const { name, email, password } = req.body;

    var newCredentials = {};

    if (password == "") {
      newCredentials = { name: name, email: email };
    } else
      newCredentials = {
        name: name,
        email: email,
        password: password,
      };

    updateAdmin(newCredentials, token)
      .then(function () {
        res.status(304).redirect("/");
      })
      .catch(function (error) {
        handleErrors(error, res);
      });
  });

  app.post("/admin/:id/delete", function (req, res) {
    const id = req.params.id;

    const token = req.signedCookies.token;

    deleteAdmin(id, token)
      .then(function () {
        res.status(304).redirect("/");
      })
      .catch(function (error) {
        handleErrors(error, res);
      });
  });
}

/****
ADMIN
****/

const LoginAnd = {
  checkMainAdmin: function (token) {
    promise = new Promise(function (resolve, reject) {
      AdminMethods.loginAdminByToken(token, function (err, logged, admin) {
        if (err) reject(err);

        if (admin.main) resolve(admin);
        else reject("Permission denied.");
      });
    });
    return promise;
  },
  checkLoggedAdmin: function (token) {
    promise = new Promise(function (resolve, reject) {
      AdminMethods.loginAdminByToken(token, function (err, logged, admin) {
        if (err) reject(err);

        if (logged) resolve(admin);
        else reject("Permission denied.");
      });
    });
    return promise;
  },
};

const AdminMethods = {
  /**
   * Function that tries to log the user by the token, usually,
   * stored in the cookies(req.cookies or req.signedCookies), returns
   * a boolean in the callback function
   *
   * @param { String } token
   * @param { void } callback
   */
  loginAdminByToken: function (token, callback) {
    logged = false;

    var admin;

    if (!token) return callback("Empty token", false);

    function findAdminAndSetId() {
      promise = new Promise(function (resolve, reject) {
        Admin.findOne({ token: token }, function (err, doc) {
          if (err) reject(err);

          admin = doc;
          resolve(doc != null);
        });
      });
      return promise;
    }

    function setLogged(exists) {
      promise = new Promise(function (resolve, reject) {
        if (exists) {
          logged = true;
          resolve();
        } else reject("Admin not found!");
      });
      return promise;
    }

    findAdminAndSetId()
      .then(setLogged)
      .then(function () {
        callback("", logged, admin);
      })
      .catch(function (error) {
        callback(error, logged, null);
      });
  },

  /**
   * Function that tries to log the user by the credentials.
   *
   * @param { Object } credentials
   * @param { String } token
   */
  loginAdminByCredentials: function (credentials, token) {
    const { email, password } = credentials;

    promise = new Promise(function (resolve, reject) {
      Admin.findOneAndUpdate(
        { email: email, password: encrypt(password, secretKey) },
        { $set: { token: token } },
        function (err, doc) {
          if (err) reject(err);

          /*Check document existence*/
          if (doc) resolve(true);
          else resolve(false);
        }
      );
    });
    return promise;
  },

  /**
   * Function that creates an admin, requires token and be the main admin.
   * Returns a promise.
   *
   * @param { Object } credentials
   * @param { String } token
   */
  createAdmin: function (credentials, token) {
    const { name, email, password } = credentials;

    const { checkMainAdmin } = LoginAnd;

    /*Admin ID increment*/
    function incrementAdmin(admin) {
      promise = new Promise(function (resolve, reject) {
        Increment.findOneAndUpdate(
          { id: "increment" },
          { $inc: { admin: 1 } },
          {
            new: true,
          },
          function (err, doc) {
            if (err) reject(err);

            resolve(doc.admin);
          }
        );
      });
      return promise;
    }

    /*Admin creation*/
    function adminCreate(adminInc) {
      promise = new Promise(function (resolve, reject) {
        adminNew = new Admin({
          name: name,
          email: email,
          password: password,
          id: adminInc,
        });

        adminNew.save(function (err) {
          if (err) {
            if (err.name == "ValidationError") {
              errorList = [];

              const nameMessage =
                err.errors["name"] != null ? err.errors["name"].message : "";
              const emailMessage =
                err.errors["email"] != null ? err.errors["email"].message : "";
              const passwordMessage =
                err.errors["password"] != null
                  ? err.errors["password"].message
                  : "";

              errorList.push(nameMessage, emailMessage, passwordMessage);

              reject({ type: "ValidationError", errors: errorList });
            } else reject(err);
          }

          resolve();
        });
      });
      return promise;
    }

    return checkMainAdmin(token).then(incrementAdmin).then(adminCreate);
  },

  /**
   * Function that updates an admin, requires token and be the main admin.
   * Returns a promise.
   *
   * @param { Object } newCredentials
   * @param { String } token
   */
  updateAdmin: function (newCredentials, token) {
    const { checkLoggedAdmin } = LoginAnd;

    function adminUpdate() {
      promise = new Promise(function (resolve, reject) {
        Admin.updateOne(
          { token: token },
          { $set: newCredentials },
          {
            runValidators: true,
            new: true,
          },
          function (err) {
            if (err) {
              if (err.name == "ValidationError") {
                errorList = [];

                const nameMessage =
                  err.errors["name"] != null ? err.errors["name"].message : "";
                const emailMessage =
                  err.errors["email"] != null
                    ? err.errors["email"].message
                    : "";
                const passwordMessage =
                  err.errors["password"] != null
                    ? err.errors["password"].message
                    : "";

                errorList.push(nameMessage, emailMessage, passwordMessage);

                reject({ type: "ValidationError", errors: errorList });
              } else reject(err);
            }

            resolve();
          }
        );
      });
      return promise;
    }

    return checkLoggedAdmin(token).then(adminUpdate);
  },

  /**
   * Function that deletes an admin, requires token and be the main admin.
   * Returns a promise.
   *
   * @param { Number } id
   * @param { String } token
   */
  deleteAdmin: function (id, token) {
    const { checkMainAdmin } = LoginAnd;

    function adminDelete() {
      promise = new Promise(function (resolve, reject) {
        Admin.deleteOne({ id: id }, function (err) {
          if (err) reject(err);

          resolve();
        });
      });
      return promise;
    }

    return checkMainAdmin(token).then(adminDelete);
  },
};

/****
POST
****/

const PostMethods = {
  /**
   * Function that creates a post, requires token.
   * Returns a promise.
   *
   * @param { Object } post
   * @param { String } token
   */
  createPost: function (post, token) {
    const { title, content } = post;

    const { checkLoggedAdmin } = LoginAnd;

    /*Post ID increment*/
    function incrementPost(admin) {
      promise = new Promise(function (resolve, reject) {
        Increment.findOneAndUpdate(
          { id: "increment" },
          { $inc: { post: 1 } },
          {
            new: true,
          },
          function (err, doc) {
            let postIds = {};

            if (err) reject(err);

            postIds = Object.assign(postIds, {
              postId: doc.post,
              adminId: admin.id,
            });

            resolve(postIds);
          }
        );
      });
      return promise;
    }

    /*Post creation*/
    function postCreate(postIds) {
      promise = new Promise(function (resolve, reject) {
        const { postId, adminId } = postIds;

        postNew = new Post({
          title: title,
          content: content,
          id: postId,
          adminId: adminId,
        });

        postNew.save(function (err) {
          if (err) {
            if (err.name == "ValidationError") {
              errorList = [];

              console.table(err.name);

              const titleMessage =
                err.errors["title"] != null ? err.errors["title"].message : "";
              const contentMessage =
                err.errors["content"] != null
                  ? err.errors["content"].message
                  : "";

              errorList.push(titleMessage, contentMessage);

              reject({ type: "ValidationError", errors: errorList });
            } else reject(err);
          }

          resolve(postId);
        });
      });
      return promise;
    }

    return checkLoggedAdmin(token).then(incrementPost).then(postCreate);
  },

  /**
   * Function that updates a post, requires token.
   * Returns a promise.
   *
   * @param { Object } post
   * @param { String } token
   */
  updatePost: function (post, token) {
    const { checkLoggedAdmin } = LoginAnd;

    function checkOwner(admin) {
      promise = new Promise(function (resolve, reject) {
        Post.findOne({ id: post.id }, function (err, doc) {
          if (err) reject(err);
          if ((doc != null) & (doc.adminId == admin.id) || admin.main)
            resolve();
          else reject("Invalid post or not an owner.");
        });
      });
      return promise;
    }

    function postUpdate() {
      promise = new Promise(function (resolve, reject) {
        Post.findOneAndUpdate(
          { id: post.id },
          { $set: { title: post.title, content: post.content } },
          {
            new: true,
            runValidators: true,
          },
          function (err) {
            if (err) {
              if (err.name == "ValidationError") {
                errorList = [];

                const titleMessage =
                  err.errors["title"] != null
                    ? err.errors["title"].message
                    : "";
                const contentMessage =
                  err.errors["content"] != null
                    ? err.errors["content"].message
                    : "";

                errorList.push(titleMessage, contentMessage);

                reject({ type: "ValidationError", errors: errorList });
              } else reject(err);
            }

            resolve();
          }
        );
      });
      return promise;
    }

    return checkLoggedAdmin(token).then(checkOwner).then(postUpdate);
  },

  /**
   * Function that deletes a post, requires his id and admin token.
   * Returns a promise.
   *
   * @param { Number } postId
   * @param { String } token
   */
  deletePost: function (postId, token) {
    const { checkLoggedAdmin } = LoginAnd;

    function checkOwner(admin) {
      promise = new Promise(function (resolve, reject) {
        Post.findOne({ id: postId }, function (err, doc) {
          if (err) reject(err);
          if ((doc != null) & (doc.adminId == admin.id) || admin.main)
            resolve();
          else reject("Invalid post or not an owner.");
        });
      });
      return promise;
    }

    function postDelete() {
      return Post.deleteOne({ id: postId }, function (err) {
        if (err) reject(err);
      });
    }

    return checkLoggedAdmin(token).then(checkOwner).then(postDelete);
  },
};

function handleErrors(errors, res) {
  if (errors.type == "ValidationError") {
    /*Validation multiple error*/
    console.log("Error: " + error.errors);
    res.send(`Error: ${error.errors}`);
  } else {
    /*One error*/
    console.log("Error: " + errors);
    res.send("Permission denied.");
  }
}

module.exports = {
  getController,
  postController,
  LoginAnd,
  PostMethods,
  AdminMethods
};
