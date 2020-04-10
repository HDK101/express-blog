const { connect, listen, app, config } = require("./Server/server");

listen();
connect(config.blogName);


/*Models*/
const models = require("./models/models");

/*Controllers*/
const { setSettings, getController, postController } = require("./controller/controllers");

setSettings({ secretKey: config.secretKey });
getController(app, models);
postController(app, models);

app.use("*", function(req, res) {
  res.status(404).send("404");
});
