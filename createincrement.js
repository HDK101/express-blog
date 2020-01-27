const mongoose = require("mongoose");
const { Increment } = require("./models/increment");

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect("mongodb://localhost/blogsys");
const db = mongoose.connection;
db.on("error", console.error.bind("Connection failure"));
db.on("open", function() {
    console.log("DB connected!");
});

incrementDb = new Increment({
  post: 0,
  admin: 0,
  user: 0,
  comment: 0,
  id: "increment"
});

incrementDb.save(function(err){
    if(err) throw err;
    console.log("Increments created!");
});
