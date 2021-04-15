const authRoute = require("./authRoute");
const dashboardRoute = require("./dashboardRoute");
const uploadRoute = require("./uploadRoutes");
const courseRoute = require("./courseRoute");
const indexRoute = require("./indexRoute");
// const joinCodeRoute = require("./joinCodeRoute");

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