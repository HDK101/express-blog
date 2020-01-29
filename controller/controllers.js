
/*
GET
*/
function getController(app, models) {
  const { Increment, Admin, Comment, Post, User } = models;
  app.get("/", function(req, res) {
    res.send("Hello there!");
  });

  /*BLOG POST*/
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
}

/*
POST
*/
function postController(app, models) {
    const { Increment, Admin, Comment, Post, User } = models;
  
    /*BLOG POST*/
    app.post("/post/create", function(req, res) {
      const { title, content } = req.body;
  
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
          if(err) return console.log(err);
  
          res.status(304).redirect("/post/" + id);
        }
      );
    });
  }
  
  module.exports = { getController, postController };
  
