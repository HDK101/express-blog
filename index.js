const { connect, app, config } = require("./Server/server");

connect(config.blogName);

/*Models*/
const models = require("./models/models");

/*Controllers*/
const { setKey, getController, postController } = require("./controller/controllers");

setKey(config.secretKey);
getController(app, models);
postController(app, models);

app.use("*", function(req, res) {
  res.status(404).send("404");
});
