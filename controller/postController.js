function postController(app, models) {
  const { Increment, Admin, Comment, Post, User } = models;
  console.log(Increment);

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
        res.send("Post created!");
      });
    });
  });
}

module.exports = { postController };
