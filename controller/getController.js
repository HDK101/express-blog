function getController(app, models) {
    const { Increment, Admin, Comment, Post, User } = models;
    app.get("/", function(req, res) {
    res.send("Hello there!");
  });

  /*BLOG POST*/
  app.get("/post/create", function(req, res) {
    res.render("index", { page: "postCreate" });
    // res.send("Post create");
  });
  app.get("/post/:id", function(req, res) {

    res.render("index", { page: "postShow", title:"A", content: "A" });
  });
  app.get("/post/:id/update", function(req, res) {
    res.send("Post update");
  });
  app.get("/post/:id/delete", function(req, res) {
    res.send("Post delete");
  });
}

module.exports = { getController };
