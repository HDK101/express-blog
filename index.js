const { app, mongoose } = require("./Config/config");

/*Models*/
const models = require("./models/models");

/*Controllers*/
const { getController, postController } = require("./controller/controllers");

getController(app, models);
postController(app, models);

app.use("*", function(req, res) {
  res.status(404).send("404");
});
