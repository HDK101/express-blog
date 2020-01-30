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
    res.send("Hello there!");
  });

  /*********
  BLOG POST
  *********/
  app.get("/post/create", function(req, res) {
    res.render("index", {
      page: "postCreate"
    });
    // res.send("Post create");
  });
  app.get("/post/:id", function(req, res) {
    res.header("Cache-Control", "no-cache");
    const id = req.params.id;

    Post.findOne({ id: id }, function(err, post) {
      if (err) return console.log(err);

      if (post) {
        res.render("index", {
          page: "postShow",
          title: post.title,
          content: post.content,
          id: id
        });
      } else {
        res.send("Post not found!");
      }
    });
  });
  app.get("/post/:id/update", function(req, res) {
    const id = req.params.id;
    Post.findOne({ id: id }, function(err, post) {
      if (err) return console.log(err);

      if (post) {
        res.render("index", {
          page: "postUpdate",
          title: post.title,
          content: post.content,
          id: id
        });
      } else {
        res.send("Post not found!");
      }
    });
  });
  app.get("/post/:id/delete", function(req, res) {
    const id = req.params.id;
    res.render("index", {
      page: "postDelete",
      id: id
    });
  });
  app.get("/post/:id/delete/yes", function(req, res) {
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
    res.render("index", {
      page: "adminLogin"
    });
  });
}

/*
POST
*/
function postController(app, models) {
  /********
  BLOG POST
  ********/
  app.post("/post/create", function(req, res) {
    const { title, content } = req.body;

    adminLoginByToken(req.signedCookies.token, function(logged) {
      console.log("Logged?" + logged);
    });

    /*Post ID increment*/
    const incrementPromise = new Promise(function(resolve, reject) {
      incNew = Increment.findOneAndUpdate(
        { id: "increment" },
        { $inc: { post: 1 } },
        {
          new: true
        }
      );
      resolve(incNew);
    }).then(function(inc) {
      /*Post create*/
      postNew = new Post({
        title: title,
        content: content,
        id: inc.post,
        adminId: 0
      });

      postNew.save(function(err) {
        if (err) console.log(err);
        res.status(304).redirect("/post/" + inc.post);
      });
    });
  });

  app.post("/post/update", function(req, res) {
    const { title, content, id } = req.body;

    Post.findOneAndUpdate(
      { id: id },
      { $set: { title: title, content: content } },
      {
        new: true
      },
      function(err) {
        if (err) return console.log(err);

        res.status(304).redirect("/post/" + id);
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
    }

    findAndUpdateAdmin()
      .then(setBrowserToken)
      .then(redirectOrError)
      .catch(function(reason) {
        console.log("Error! " + reason);
      });
  });
}

function adminLoginByToken(token, callback) {
  let logged = false;

  function findAdmin() {
    promise = new Promise(function(resolve, reject) {
      Admin.findOne({ token: token }, function(err, doc) {
        if (err) reject(err);
        if (doc) resolve(true);
      });
    });
    return promise;
  }

  function setLogged(exists) {
    promise = new Promise(function(resolve, reject) {
      if (exists) resolve(true);
      else reject("Admin not found!");
    });
    return promise;
  }

  findAdmin()
    .then(setLogged)
    .then(callback)
    .catch(function(error) {
      console.log("Error! " + error);
    });
}

module.exports = { setKey, getController, postController };
