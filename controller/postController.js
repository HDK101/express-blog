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

module.exports = { postController };
