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
  app.get("/", function(req, res) {
    postsPage(res);
  });

  /*********
  BLOG POST
  *********/
  app.get("/posts", function(req, res) {
    postsPage(res);
  });

  function postsPage(res) {
    Post.find()
      .limit(10)
      .exec(function(err, docs) {
        if (err) return console.log(err);

        let posts = [];

        index = 0;
        docsLength = docs.length;

        for (index = 0; index < docsLength; index++) {
          let reverseIndex = docsLength - index - 1;

          let post = {
            title: docs[reverseIndex].title,
            content: docs[reverseIndex].content
          };

          posts.push(post);
        }

        if (posts.length == 0) {
          res.send("No posts found.");
        } else {
          res.render("posts/feed", { posts: posts });
        }
      });
  }

  app.get("/posts/create", function(req, res) {
    res.render("posts/create");
  });
  app.get("/posts/:id", function(req, res) {
    res.header("Cache-Control", "no-cache");
    const id = req.params.id;

    Post.findOne({ id: id }, function(err, post) {
      if (err) return console.log(err);

      if (post) {
        res.render("posts/read", {
          title: post.title,
          content: post.content,
          id: id
        });
      } else {
        res.send("Post not found!");
      }
    });
  });
  app.get("/posts/:id/update", function(req, res) {
    const id = req.params.id;
    Post.findOne({ id: id }, function(err, post) {
      if (err) return console.log(err);

      if (post) {
        res.render("posts/update", {
          title: post.title,
          content: post.content,
          id: post.id
        });
      } else {
        res.send("Post not found!");
      }
    });
  });
  app.get("/posts/:id/delete", function(req, res) {
    const id = req.params.id;
    res.render("posts/delete", {
      id: id
    });
  });
  app.get("/posts/:id/delete/yes", function(req, res) {
    const id = req.params.id;
    Post.deleteOne({ id: id }, function(err) {
      if (err) return console.log(err);
      res.status(304).redirect("/");
    });
  });

  /****
  ADMIN
  ****/

  app.get("/admin/create", function(req, res) {
    res.end();
  });
  app.get("/admin/login", function(req, res) {
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
  app.post("/posts/create", function(req, res) {
    const { title, content } = req.body;

    function loginByToken() {
      promise = new Promise(function(resolve, reject) {
        adminLoginByToken(req.signedCookies.token, function(err, logged, id) {

          if (err) reject(err);
          
          if (logged) resolve(id);
          else reject("Permission denied.");
        });
      });
      return promise;
    }

    /*Post ID increment*/
    function incrementPost(adminId) {
      promise = new Promise(function(resolve, reject) {
        Increment.findOneAndUpdate(
          { id: "increment" },
          { $inc: { post: 1 } },
          {
            new: true
          },
          function(err, doc) {
            let postIds = {};

            if (err) reject(err);

            postIds = Object.assign(postIds, { post: doc.post, admin: adminId });

            resolve(postIds);
          }
        );
      });
      return promise;
    }

    /*Post creation*/
    function postCreate(ids) {
      promise = new Promise(function(resolve, reject) {
        const { post, admin } = ids;
        
        postNew = new Post({
          title: title,
          content: content,
          id: post,
          adminId: admin
        });

        postNew.save(function(err) {
          if (err) reject(err);
          resolve(post);
        });
      });
      return promise;
    }

    loginByToken()
      .then(incrementPost)
      .then(postCreate)
      .then(function(id) {
        res.status(304).redirect("/posts/" + id);
      })
      .catch(function(error) {
        console.log("Error: " + error);
        res.send("Permission denied.");
      });
  });

  app.post("/posts/update", function(req, res) {
    const { title, content, id } = req.body;

    Post.findOneAndUpdate(
      { id: id },
      { $set: { title: title, content: content } },
      {
        new: true
      },
      function(err) {
        if (err) return console.log(err);

        res.status(304).redirect("/posts/" + id);
      }
    );
  });

  /****
  ADMIN
  ****/

  app.post("/admin/login", function(req, res) {
    const { email, password } = req.body;

    const token = encrypt(`${Math.random() * 1000}${email}`, getSecretKey());

    /*Find Admin and, if credentials is valid, set a token in DB*/
    function findAndUpdateAdmin() {
      promise = new Promise(function(resolve, reject) {
        Admin.findOneAndUpdate(
          { email: email, password: password },
          { $set: { token: token } },
          function(err, doc) {
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
      promise = new Promise(function(resolve, reject) {
        if (adminFound) {
          res.cookie("token", token, { signed: true });
          resolve(true);
        } else resolve(false);
      });
      return promise;
    }

    /*Redirect to home page or send error*/
    function redirectOrError(cookieDone) {
      promise = new Promise(function(resolve, reject) {
        if (cookieDone) res.status(304).redirect("/");
        else res.send("Invalid credentials!");
        resolve();
      });
      return promise;
    }

    findAndUpdateAdmin()
      .then(setBrowserToken)
      .then(redirectOrError)
      .catch(function(reason) {
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
  id = -1;

  if (!token) return callback("Empty token", false);

  function findAdminAndSetId() {
    promise = new Promise(function(resolve, reject) {
      Admin.findOne({ token: token }, function(err, doc) {
        if (err) reject(err);

        id = doc.id;
        resolve(doc != null);
      });
    });
    return promise;
  }

  function setLogged(exists) {
    promise = new Promise(function(resolve, reject) {
      if (exists) {
        logged = true;
        resolve();
      } else reject("Admin not found!");
    });
    return promise;
  }

  findAdminAndSetId()
    .then(setLogged)
    .finally(function() {
      callback("", logged, id);
    })
    .catch(function(error) {
      callback(error, logged, -1);
    });
}

module.exports = { setKey, getController, postController, adminLoginByToken };
