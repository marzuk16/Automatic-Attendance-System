const authRoute = require("./authRoute");
const dashboardRoute = require("./dashboardRoute");
const uploadRoute = require("./uploadRoutes");
const courseRoute = require("./courseRoute");
const indexRoute = require("./indexRoute");
const instituteRoute = require("./instituteRoute");
const contactUs = require("./contactUsRoutes");

const routes = [
    {
        path: "/auth",
        handler: authRoute
    },
    {
        path: "/dashboard",
        handler: dashboardRoute
    },
    {
        path: "/uploads",
        handler: uploadRoute
    },
    {
        path: "/courses",
        handler: courseRoute
    },
    {
        path: "/home",
        handler: indexRoute
    },
    {
        path: "/institute",
        handler: instituteRoute
    },
    {
        path: "/contact-us",
        handler: contactUs
    },
    {
        path: "/",
        handler: (req, res) => {
            res.redirect("/home");
        }
    }
];

module.exports = app => {
    routes.forEach(r => {
        if (r.path === "/") {
            app.get(r.path, r.handler);
        }
        else {
            app.use(r.path, r.handler);
        }
    });
};