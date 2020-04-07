var { encrypt, decrypt } = require("../components/crypto");
const { Increment, Admin, Comment, Post, User } = require("../models/models");

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
 * @param { string } key - Key for encrypting
 */
function setKey(key) {
  settings.secretKey = key;
}

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
function getController(app, models) {
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
    Post.find()
      .limit(10)
      .exec(function (err, docs) {
        if (err) return console.log(err);

        function getAdminNames() {
          promise = new Promise(function (resolve, reject) {
            Admin.find(function (err, admins) {
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

    deletePost(id, req.signedCookies.token)
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
    res.end();
  });
  app.get("/admin/login", function (req, res) {
    res.render("admin/login");
  });
}

/*
POST
*/
function postController(app, models) {
  /********
  BLOG POST
  ********/
  app.post("/posts/create", function (req, res) {
    createPost(req.body, req.signedCookies.token)
      .then(function (id) {
        res.status(304).redirect("/posts/" + id);
      })
      .catch(function (error) {
        console.log("Error: " + error);
        res.send("Permission denied.");
      });
  });

  app.post("/posts/update", function (req, res) {
    const { title, content, id } = req.body;

    Post.findOneAndUpdate(
      { id: id },
      { $set: { title: title, content: content } },
      {
        new: true,
      },
      function (err) {
        if (err) return console.log(err);

        res.status(304).redirect("/posts/" + id);
      }
    );
  });

  /****
  ADMIN
  ****/

  app.post("/admin/login", function (req, res) {
    const { email, password } = req.body;

    const token = encrypt(`${Math.random() * 1000}${email}`, getSecretKey());
    const encryptedPassword = encrypt(password, getSecretKey());

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
        else res.send("Invalid credentials!");
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
}
/**
 * Function that tries to log the user by the token, usually,
 * stored in the cookies(req.cookies or req.signedCookies), returns
 * a boolean in the callback function
 *
 * @param { String } token
 * @param { void } callback
 */
function adminLoginByToken(token, callback) {
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
    .finally(function () {
      callback("", logged, admin);
    })
    .catch(function (error) {
      callback(error, logged, null);
    });
}

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
      adminLoginByToken(token, function (err, logged, admin) {
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
      adminLoginByToken(token, function (err, logged, admin) {
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
  setKey,
  getController,
  postController,
  adminLoginByToken,
  createPost,
};
