// all thing visibole from this file to views

module.exports = () => {
    return (req, res, next) => {
        res.locals.user = req.user;
        res.locals.isLoggedIn = req.session.isLoggedIn;

        next();
    };
};