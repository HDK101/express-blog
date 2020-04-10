var { encrypt } = require("../components/crypto");
const { Increment, Admin, Post } = require("../models/models");

settings = {};

const getSecretKey = () => {
  if (!settings.secretKey) throw "Special key not set!";
  return settings.secretKey;
};

/*
Controller settings
*/

/**
 *
 * @param { Object } config - Configuration object
 * Set settings for controller
 *
 * Settings:
 * - secretKey : String
 *
 */
function setSettings(config) {
  settings = Object.assign(settings, config);
}

/*
GET
*/
function getController(app) {
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
  app.get("/posts/:id/delete/yes", function (req, res) {
    const id = req.params.id;
    const token = req.signedCookies.token;

    deletePost(id, token)
      .then(function () {
        res.status(304).redirect("/");
      })
      .catch(function (error) {
        console.log("Error: " + error);
        res.send("Permission denied.");
      });
  });

  /****
  ADMIN
  ****/

  app.get("/admin/create", function (req, res) {
    const token = req.signedCookies.token;

    function loginByToken() {
      promise = new Promise(function (resolve, reject) {
        loginAdminByToken(token, function (err, logged, admin) {
          if (err) reject(err);

          if (admin.main) {
            resolve();
          } else reject("Permission denied.");
        });
      });
      return promise;
    }

    loginByToken()
      .then(function () {
        res.render("admin/create");
      })
      .catch(function (error) {
        console.log("Error: " + error);
        res.send("Permission denied.");
      });
  });

  app.get("/admin/update", function (req, res) {
    const token = req.signedCookies.token;

    function loginByToken() {
      promise = new Promise(function (resolve, reject) {
        loginAdminByToken(token, function (err, logged, admin) {
          if (err) reject(err);

          if (logged) {
            resolve(admin);
          } else reject("Permission denied.");
        });
      });
      return promise;
    }

    loginByToken().then(function (admin) {
      extractedAdmin = { name: admin.name, email: admin.email };

      res.render("admin/update", { admin: extractedAdmin });
    });
  });

  app.get("/admin/delete", function (req, res) {
    var admins = [];

    const token = req.signedCookies.token;

    function loginByToken() {
      promise = new Promise(function (resolve, reject) {
        loginAdminByToken(token, function (err, logged, admin) {
          if (err) reject(err);

          if (admin.main) {
            resolve();
          } else reject("Permission denied.");
        });
      });
      return promise;
    }

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

    loginByToken()
      .then(findAdmins)
      .then(function () {
        res.render("admin/delete", { admins: admins });
      })
      .catch(function (error) {
        console.log("Error: " + error);
        res.send("Permission denied.");
      });
  });

  app.get("/admin/delete/:id", function (req, res) {
    const id = req.params.id;

    const token = req.signedCookies.token;

    deleteAdmin(id, token)
      .then(function () {
        res.status(304).redirect("/");
      })
      .catch(function (error) {
        console.log("Error: " + error);
        res.send("Permission denied.");
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
        console.log("Error: " + error);
        res.send("Permission denied.");
      });
  });
}

/*
POST
*/
function postController(app) {
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
        console.log("Error: " + error);
        res.send("Permission denied.");
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
        console.log("Error: " + error);
        res.send("Permission denied.");
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
        console.log("Error: " + error);
        res.send("Permission denied.");
      });
  });

  app.post("/admin/login", function (req, res) {
    var { email, password } = req.body;

    /*Generate unique and random string*/
    const token = encrypt(`${Math.random() * 1000}${email}`, getSecretKey());
    password = encrypt(password, getSecretKey());

    /*Find Admin and, if credentials is valid, set a token in DB*/
    function findAndUpdateAdmin() {
      promise = new Promise(function (resolve, reject) {
        Admin.findOneAndUpdate(
          { email: email, password: encryptedPassword },
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
    }

    /*Set cookie "token" in browser*/
    function setBrowserToken(adminFound) {
      promise = new Promise(function (resolve, reject) {
        if (adminFound) {
          res.cookie("token", token, { signed: true });
          resolve(true);
        } else resolve(false);
      });
      return promise;
    }

    /*Redirect to home page or send error*/
    function redirectOrError(cookieDone) {
      promise = new Promise(function (resolve, reject) {
        if (cookieDone) res.status(304).redirect("/");
        else {
          res.send("Invalid credentials!");
          reject("Invalid credentials!");
        }
        resolve();
      });
      return promise;
    }

    findAndUpdateAdmin()
      .then(setBrowserToken)
      .then(redirectOrError)
      .catch(function (reason) {
        console.log("Error! " + reason);
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
        password: encrypt(password, getSecretKey()),
      };

    updateAdmin(newCredentials, token)
      .then(function () {
        res.status(304).redirect("/");
      })
      .catch(function (error) {
        console.log("Error: " + error);
        res.send("Permission denied.");
      });
  });
}
/**
 * Function that tries to log the user by the token, usually,
 * stored in the cookies(req.cookies or req.signedCookies), returns
 * a boolean in the callback function
 *
 * @param { String } token
 * @param { void } callback
 */
function loginAdminByToken(token, callback) {
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

  return findAdminAndSetId()
    .then(setLogged)
    .then(function () {
      callback("", logged, admin);
    })
    .catch(function (error) {
      callback(error, logged, null);
    });
}

/****
ADMIN
****/

function loginAdminByCredentials(credentials, token) {
  const { email, password } = credentials;

  promise = new Promise(function (resolve, reject) {
    Admin.findOneAndUpdate(
      { email: email, password: encrypt(password, getSecretKey()) },
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
}

/**
 * Function that creates an admin, requires token and be the main admin.
 * Returns a promise.
 *
 * @param { Object } credentials
 * @param { String } token
 */
function createAdmin(credentials, token) {
  const { name, email, password } = credentials;

  function loginByToken() {
    promise = new Promise(function (resolve, reject) {
      loginAdminByToken(token, function (err, logged, admin) {
        if (err) reject(err);

        if (admin.main) resolve();
        else reject("Permission denied.");
      });
    });
    return promise;
  }

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
        password: encrypt(password, getSecretKey()),
        id: adminInc,
      });

      adminNew.save(function (err) {
        if (err) reject(err);
        resolve();
      });
    });
    return promise;
  }

  return loginByToken().then(incrementAdmin).then(adminCreate);
}

/**
 * Function that updates an admin, requires token and be the main admin.
 * Returns a promise.
 *
 * @param { Object } newCredentials
 * @param { String } token
 */
function updateAdmin(newCredentials, token) {
  function loginByToken() {
    promise = new Promise(function (resolve, reject) {
      loginAdminByToken(token, function (err, logged, admin) {
        if (err) reject(err);
        else if (!logged) reject("Permission denied.");
        else resolve();
      });
    });
    return promise;
  }

  function adminUpdate() {
    promise = new Promise(function (resolve, reject) {
      Admin.updateOne(
        { token: token },
        { $set: newCredentials },
        {
          new: true,
        },
        function (err) {
          if (err) reject(err);
          resolve();
        }
      );
    });
    return promise;
  }

  return loginByToken().then(adminUpdate);
}

/**
 * Function that deletes an admin, requires token and be the main admin.
 * Returns a promise.
 *
 * @param { Number } id
 * @param { String } token
 */
function deleteAdmin(id, token) {
  function loginByToken() {
    promise = new Promise(function (resolve, reject) {
      loginAdminByToken(token, function (err, logged, admin) {
        if (err) reject(err);

        if (admin.main) {
          resolve();
        } else reject("Permission denied.");
      });
    });
    return promise;
  }

  function adminDelete() {
    promise = new Promise(function (resolve, reject) {
      Admin.deleteOne({ id: id }, function (err) {
        if (err) reject(err);

        resolve();
      });
    });
    return promise;
  }

  return loginByToken().then(adminDelete);
}

/****
POST
****/

/**
 * Function that creates a post, requires token.
 * Returns a promise.
 *
 * @param { Object } post
 * @param { String } token
 */
function createPost(post, token) {
  const { title, content } = post;

  function loginByToken() {
    promise = new Promise(function (resolve, reject) {
      loginAdminByToken(token, function (err, logged, admin) {
        if (err) reject(err);

        if (logged) resolve(admin);
        else reject("Permission denied.");
      });
    });
    return promise;
  }

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
        if (err) reject(err);
        resolve(postId);
      });
    });
    return promise;
  }

  return loginByToken().then(incrementPost).then(postCreate);
}

/**
 * Function that updates a post, requires token.
 * Returns a promise.
 *
 * @param { Object } post
 * @param { String } token
 */
function updatePost(post, token) {
  function loginByToken() {
    promise = new Promise(function (resolve, reject) {
      loginAdminByToken(token, function (err, logged, admin) {
        if (err) reject(err);

        if (logged) {
          adminId = admin.id;
          resolve(admin);
        } else reject("Permission denied.");
      });
    });
    return promise;
  }

  function checkOwner(admin) {
    promise = new Promise(function (resolve, reject) {
      Post.findOne({ id: post.id }, function (err, doc) {
        if (err) reject(err);
        if ((doc != null) & (doc.adminId == admin.id) || admin.main) resolve();
        else reject("Invalid post or not an owner.");
      });
    });
    return promise;
  }

  function postUpdate() {
    return Post.findOneAndUpdate(
      { id: post.id },
      { $set: { title: post.title, content: post.content } },
      {
        new: true,
      },
      function (err) {
        if (err) return console.log(err);
      }
    );
  }

  return loginByToken().then(checkOwner).then(postUpdate);
}

/**
 * Function that deletes a post, requires his id and admin token.
 * Returns a promise.
 *
 * @param { Number } postId
 * @param { String } token
 */
function deletePost(postId, token) {
  let adminId;

  function loginByToken() {
    promise = new Promise(function (resolve, reject) {
      loginAdminByToken(token, function (err, logged, admin) {
        if (err) reject(err);

        if (logged) {
          adminId = admin.id;
          resolve(admin);
        } else reject("Permission denied.");
      });
    });
    return promise;
  }

  function checkOwner(admin) {
    promise = new Promise(function (resolve, reject) {
      Post.findOne({ id: postId }, function (err, doc) {
        if (err) reject(err);
        if ((doc != null) & (doc.adminId == admin.id) || admin.main) resolve();
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

  return loginByToken().then(checkOwner).then(postDelete);
}

module.exports = {
  setSettings,
  getController,
  postController,
  loginAdminByToken,
  loginAdminByCredentials,
  createPost,
  updatePost,
  deletePost,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
