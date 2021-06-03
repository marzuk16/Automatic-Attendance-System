require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const config = require("config");

const setMiddleware = require("./middleware/middleware");

const setRoutes = require("./routes/routes");

const app = express();

//variables for db configure
const PORT = process.env.PORT || 3000;
const dbUser = config.get("db-username");
const dbUserPass = config.get("db-password");
const dbName = "attendanceSystem";
const mongoDBUrl = `mongodb+srv://${dbUser}:${dbUserPass}@cluster0.arzvi.mongodb.net/${dbName}?retryWrites=true&w=majority`;
// const mongoDBUrl = `mongodb://localhost/${dbName}`;


//setup view Engine
app.set("view engine", "ejs");
app.set("views", "views") // configure default views root directory

//Using middleware from middleware directory 
setMiddleware(app);

//Using routes from routes directory
setRoutes(app);

//error middleware
app.use((req, res, next) => {
    let error = new Error("404 Page Not Found !");
    error.status = 404;

    next(error);
});

app.use( (error, req, res, next) =>{
    if(error.status === 404){
        return res.render("pages/error/404", {flashMessage: {}});
    }
    console.log(error);
    res.render("pages/error/500", {flashMessage: {}});
} );


mongoose.connect(mongoDBUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => {
        //console.log(`Database connected`);
        app.listen(PORT, () => {
            console.log(`SERVER IS RUNNING ON ${PORT}`);
        });
    })
    .catch(error => {
        return console.log(error);
    })