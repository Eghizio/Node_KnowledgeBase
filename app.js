const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const expressValidator = require("express-validator");
const passport = require("passport");
const config = require("./config/database")

//MongoDB
mongoose.connect(config.database, { useNewUrlParser: true });
let db = mongoose.connection;

db.once("open", function(){
  console.log("Connected to MongoDB");
});

db.on("error",function(err){
  console.log(err);
});

//Init App
const app = express();

//Bring in models
let Article = require("./models/article");

//Load View Engine: Pug(Jade)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Body Parser
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Setting public folder
app.use(express.static(path.join(__dirname,"public")));

//Express Session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Express Messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator
app.use(expressValidator());

//Passport Config
require("./config/passport")(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function(req, res, next){
  res.locals.user = req.user || null;
  next();
})

//Home
app.get("/",function(req, res){
  Article.find({},function(err, articles){
    if(err){
      console.log(err);
    }
    else{
      res.render("index", {
        title:"Articles",
        articles: articles
      });
    }
  });
});

//Routing
let articles = require("./routes/articles");
let users = require("./routes/users");
app.use("/articles",articles);
app.use("/users",users);

//Start Server
app.listen(3000,function(){
  console.log("Server start on port 3000... "+Date());
});
