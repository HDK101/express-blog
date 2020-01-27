function getController(app) {
  app.get("/", function(req, res) {
    res.send("Hello there!");
  });

  /*POST*/
  app.get("/post/:id", function(req, res) {
    res.send(req.params.id);
  });
  app.get("/post/create", function(req, res) {
     res.send("Post create");
  });
  app.get("/post/:id/update", function(req, res) {
    res.send("Post update");
  });
  app.get("/post/:id/delete", function(req, res) {
    res.send("Post delete");
  });
}

module.exports = { getController };
