const { app, mongoose, config } = require("./Server/server");

/*Models*/
const models = require("./models/models");

/*Controllers*/
const { setSettings, getController, postController } = require("./controller/controllers");

setSettings({});
getController(app, models);
postController(app, models);

app.use("*", function(req, res) {
  res.status(404).send("404");
});
