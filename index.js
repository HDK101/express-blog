const { app, mongoose } = require("./Config/config");

/*Models*/
const { Increment } = require("./models/increment");
const { Admin } = require("./models/admin");
const { Comment } = require("./models/comment");
const { Post } = require("./models/post");
const { User } = require("./models/user");

const Models = { Increment, Admin, Comment, Post, User };

/*Controllers*/
const { getController } = require("./controller/getController");
const { postController } = require("./controller/postController");

getController(app, Models);
postController(app, Models);

app.use("*", function(req, res) {
  res.status(404).send("404");
});
