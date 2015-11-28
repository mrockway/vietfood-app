var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    hbs = require("hbs"),
    mongoose = require("mongoose"),
    cookieParser = require("cookie-parser"),
    session = require("express-session"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;

require('dotenv').load();
var Yelp = require("yelp");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "hbs");

hbs.registerPartials(__dirname + "/views/partials");

mongoose.connect("mongodb://localhost/vfood-app");

var User= require("./models/user");

// middleware for auth
app.use(cookieParser());
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// passport config
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//sign up page
app.get("/signup", function (req, res) {
	if (req.user) {
		res.redirect("/");
	} else {
		res.render("signup", {user: req.user});
	}
});

//save new user to db

app.post('/signup', function (req, res) {
  User.register(new User({ username: req.body.username }), req.body.password,
    function (err, newUser) {
      passport.authenticate('local')(req, res, function() {
        res.redirect("/");
      });
    }
  );
});

//show login view
app.get("/login", function (req, res) {
	if (req.user) {
		res.redirect("/");
	} else {
		res.render("login", {user: req.user});
	}
});

//login user
app.post("/login", passport.authenticate("local"), function (req, res) {
	res.redirect("/");
});

//logout user
app.get("/logout", function (req, res) {
	req.logout();
	res.redirect("/");
});

//hello word test
app.get("/", function (req, res) {
	res.render("index");
});

//import yelp API needed keys
var yelp = new Yelp({
  consumer_key: process.env.my_consumer_key,
  consumer_secret: process.env.my_consumer_secret,
  token: process.env.my_token,
  token_secret: process.env.my_token_secret
});

//different get request for different disdes
var dishes = ["banh mi", "bun bo hue", "pho", "bun thit nuong", "bo luc lac", "cha gio", "goi cuon", "cafe sua da", "bun rieu", "che ba mau", "goi du du", "com tam bi suon cha", "hu tieu", "bo kho", "banh xeo"];

dishes.forEach(function (dish) {
	app.get("/api/" + dish.replace(/\s/g,""), function (req, res) {
		yelp.search({ term: dish, location: "San Francisco, CA", sort: 0, category_filter: "vietnamese", radius_filter: 10000, limit: 10})
			.then(function (data) {
				res.json({restaurants : data.businesses});
			})
				.catch(function (err) {
					console.error(err);
				});
	});
});

//listen to port 3000
var server = app.listen(process.env.PORT || 3000, function () {
	console.log("I'm listening");
});