const { app } = require("./Config/config");

/*Models*/
const { Admin } = require("./models/admin");
const { Comment } = require("./models/comment");
const { Post } = require("./models/post");
const { User } = require("./models/user");

const { getController } = require("./controller/getController");

getController(app);

app.use("*", function(req, res) {
    res.send("404", 404);
});




