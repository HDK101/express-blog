function getController(app, models) {
  const { Increment, Admin, Comment, Post, User } = models;
  app.get("/", function(req, res) {
    res.send("Hello there!");
  });

  /*BLOG POST*/
  app.get("/post/create", function(req, res) {
    res.render("index", {
      page: "postCreate",
      title: "",
      content: ""
    });
    // res.send("Post create");
  });
  app.get("/post/:id", function(req, res) {
    Post.findOne({ id: req.params.id }, function(err, post) {
      if (err) return console.log(err);

      if (post) {
        res.render("index", {
          page: "postShow",
          title: post.title,
          content: post.content
        });
      }
      else {
        res.send("Post not found!");
      }
    });
  });
  app.get("/post/:id/update", function(req, res) {
    res.send("Post update");
  });
  app.get("/post/:id/delete", function(req, res) {
    res.send("Post delete");
  });
}

module.exports = { getController };
