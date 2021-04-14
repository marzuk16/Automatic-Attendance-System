const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const Flash = require("../utils/Flash");

const User = require("../models/User");
const errorFormatter = require("../utils/validationErrorFormatter");

exports.signupGetController = (req, res, next) => {
    res.render("pages/auth/signup",
        {
            title: "Create A New Account",
            error: {},
            values: {},
            flashMessage: Flash.getMessage(req)
        });
};

exports.signupPostController = async (req, res, next) => {
    //console.log(req.body);
    const {userId, email, password } = req.body;

    let errors = validationResult(req).formatWith(errorFormatter);

    if (!errors.isEmpty()) {
        //return console.log(errors.mapped());

        //req.flash("fail", "please check your form !");

        return res.render("pages/auth/signup",
            {
                title: "Create A New Account",
                error: errors.mapped(),
                values: {
                    userId,
                    email
                },
                flashMessage: {}
                //flashMessage: Flash.getMessage(req)
            });
    }

    try {
        let hashedPassword = await bcrypt.hash(password, 12);

        let userObj = {
            userId,
            email,
            password: hashedPassword
        };

        let user = new User(userObj);

        await user.save(); // object created in db collections
        //console.log("User Created Successfully!", createdUser);
        req.flash("success", "User created successfully !");
        res.redirect("login");

    } catch (error) {
        //console.log(error);
        next(error);
    }
};

exports.loginGetController = (req, res, next) => {

    res.render("pages/auth/login", 
        {
            title: "Login to your account",
            error: {},
            values: {},
            flashMessage: Flash.getMessage(req)
        })
};

exports.loginPostController = async (req, res, next) => {
    const { userId, password } = req.body;

    let errors = validationResult(req).formatWith(errorFormatter);

    if (!errors.isEmpty()) {
        //return console.log(errors.mapped());

        //req.flash("fail", "please check your form !");

        return res.render("pages/auth/login",
            {
                title: "Login to your account",
                error: errors.mapped(),
                flashMessage: {},
                values: {
                    userId
                }
                //flashMessage: Flash.getMessage(req)
            });
    }

    try {
        let user = await User.findOne({ userId });
        if (!user) {
            req.flash("fail", "Invalid credentials !");
            return res.render("pages/auth/login",
            {
                title: "Login to your account",
                error: {},
                values: {},
                flashMessage: Flash.getMessage(req)
            });
        }

        let matched = await bcrypt.compare(password, user.password);
        //console.log("matched: ", matched);
        if (!matched) {
            req.flash("fail", "Invalid credentials !");
            return res.render("pages/auth/login",
            {
                title: "Login to your account",
                error: {},
                values: {},
                flashMessage: Flash.getMessage(req)
            });
        }

        //console.log("login success", user);
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(error => {
            if (error) {
                console.log(error);
                return next(error);
            }
            req.flash("success", "Login Successfull !");
            res.redirect("/dashboard");
            //res.render("pages/auth/login", { title: "Login to your account", error: {} });
        });

    } catch (error) {
        //console.log(error);
        next(error);
    }
};

exports.changePasswordGetController = async (req, res, next) => {
    res.render('pages/auth/changePassword', {
        title: 'Change Password',
        error : {},
        flashMessage: Flash.getMessage(req)
    })
};
exports.changePasswordPostController = async (req, res, next) => {
    
    let {
        oldPassword,
        newPassword,
        confirmPassword
    } = req.body;

    let errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
        console.log("errors: ", errors.mapped());

        //req.flash("fail", "please check your form !");

        return res.render("pages/auth/changePassword",
            {
                title: "Change Password",
                error: errors.mapped(),
                flashMessage: {},
                //flashMessage: Flash.getMessage(req)
            });
    }
    
    if(newPassword !== confirmPassword){
        req.flash('fail', 'Password does not match');
        return res.redirect('/auth/change-password');
    }

    try {
        let match = await bcrypt.compare(oldPassword, req.user.password);

        if(!match){
            req.flash('fail', 'Please provide a correct old password');
            return res.redirect('/auth/change-password');
        }
    
        let hash = await bcrypt.hash(newPassword, 12);

        await User.findOneAndUpdate(
            {_id: req.user._id},
            {$set: {password: hash }}
        );

        req.flash('success', 'Password updated successfully');
        return res.redirect('/auth/change-password');

    } catch (e) {
        next(e);
    }
};

exports.logoutController = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            console.log(error);
            return next();
        }
        res.redirect("/auth/login");
    });
};