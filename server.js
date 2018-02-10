"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const cookieSession = require('cookie-session');
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const mapsRoutes = require("./routes/maps");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.use(cookieSession({
  name: 'session',
  secret: "key1",
}));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));

// Mount all resource routes
app.use("/maps", mapsRoutes(knex));

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Main page
app.get("/main", (req, res) => {
  res.render("main");
});

// Registration Form STILL REDIRECTS WHERE WE DONT WANT BUT WORKS
  app.post('/register', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    knex('users')
      .returning(['id', 'name', 'password'])
      .insert({name: username, password: password})
      .then((results) => {

        req.session.user_id = results[0].id;
        res.json(results);
    });
  });

    // Login form doesnt work yet
  app.post('/login', (req, res) => {
    console.log('login');
  });

  app.delete('/logout', (req, res) => {
    // cookie session delete
    console.log('logout');
  })


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
