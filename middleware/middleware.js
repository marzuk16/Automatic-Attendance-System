const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const config = require("config");

const MongoDBStore = require("connect-mongodb-session")(session);

//import middlewares
const { bindUserWithRequest } = require("./authMiddleware");
const setLocals = require("./setLocals");

//variables for db configure
const dbUser = config.get("db-username");
const dbUserPass = config.get("db-password");
const dbName = config.get("db-name");
const mongoDBUrl = `mongodb+srv://${dbUser}:${dbUserPass}@cluster0.arzvi.mongodb.net/${dbName}?retryWrites=true&w=majority`;

//session store to mondodb
const store = new MongoDBStore({
    uri: mongoDBUrl,
    collection: "sessions",
    expires: 3 * 60 * 60 * 1000 // 3 hours
});

const middlewares = [
    morgan("dev"),
    express.static("public"), // set public directory serve as a public
    express.urlencoded({ extended: true }),
    express.json(),
    session({
        //configuration object
        secret: config.get("secret"),
        resave: false,
        saveUninitialized: false,
        store: store
    }),
    flash(),
    bindUserWithRequest(),
    setLocals() // all thing visibole from this file to views
];

module.exports = app => {
    middlewares.forEach(m => {
        app.use(m);
    });
};