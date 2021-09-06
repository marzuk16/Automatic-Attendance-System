const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const config = require("config");
const Flash = require("../utils/Flash");

const User = require("../models/User");
const errorFormatter = require("../utils/validationErrorFormatter");


const sgMail = require('@sendgrid/mail');
const apiKey = config.get("sgMail");
sgMail.setApiKey(apiKey);

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
    const { userId, email, password } = req.body;
    console.log("email: ", email);

    let errors = validationResult(req).formatWith(errorFormatter);

    if (!errors.isEmpty()) {

        return res.render("pages/auth/signup",
        {
            title: "Create A New Account",
            error: errors.mapped(),
            values: {
                userId,
                email
            },
            flashMessage: {}
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

        const createdUser = await user.save(); // object created in db collections
        console.log("createdUser: ", createdUser);

        const msg = {
            to: createdUser.email, // Change to your recipient
            from: 'marzuk777@gmail.com', // Change to your verified sender
            subject: 'Welcome to AAS',
            text: 'Weelcome to AAS',
            html: '<strong>Thanks for using AAS</strong>',
        }
        sgMail.send(msg);

        req.flash("success", "User created successfully !");
        res.redirect("login");

    } catch (error) {
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

        return res.render("pages/auth/login",
            {
                title: "Login to your account",
                error: errors.mapped(),
                flashMessage: {},
                values: {
                    userId
                }
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

        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(error => {
            if (error) {
                console.log(error);
                return next(error);
            }
            console.log("loggedin user", req.user);
            req.flash("success", "Login Successfull !");
            res.redirect("/dashboard");
        });

    } catch (error) {
        next(error);
    }
};

exports.changePasswordGetController = async (req, res, next) => {
    console.log("loggedIn user", req.user);
    res.render('pages/auth/changePassword', {
        title: 'Change Password',
        error: {},
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

        return res.render("pages/auth/changePassword",
            {
                title: "Change Password",
                error: errors.mapped(),
                flashMessage: {},
            });
    }

    if (newPassword !== confirmPassword) {
        req.flash('fail', 'Password does not match');
        return res.redirect('/auth/change-password');
    }

    try {
        let match = await bcrypt.compare(oldPassword, req.user.password);

        if (!match) {
            req.flash('fail', 'Please provide a correct old password');
            return res.redirect('/auth/change-password');
        }

        let hash = await bcrypt.hash(newPassword, 12);

        await User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { password: hash } }
        );

        req.flash('success', 'Password updated successfully');
        return res.redirect('/auth/change-password');

    } catch (e) {
        next(e);
    }
};

exports.resetPasswordGetController = async (req, res, next) => {
    res.render('pages/auth/resetPassword', {
        title: 'Change Password',
        error: {},
        flashMessage: Flash.getMessage(req),
    })
};
exports.resetPasswordPostController = (req, res, next) => {
    const { userId } = req.body;

    let errors = validationResult(req).formatWith(errorFormatter);

    if (!errors.isEmpty()) {
        console.log("reset errors: ", errors.mapped());

        return res.render("pages/auth/resetPassword",
            {
                title: "Change Password",
                error: errors.mapped(),
                flashMessage: {},
            });
    }

    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) console.log("crypto error: ", err);
            const token = await buffer.toString("hex");

            let user = await User.findOneAndUpdate(
                { userId },
                { $set: { resetToken: token, expireToken: Date.now() + 900 } }
            );
            if (!user) {
                req.flash("fail", "Invalid userId !");
                return res.render("pages/auth/resetPassword",
                    {
                        title: "Change Password",
                        error: {},
                        flashMessage: Flash.getMessage(req)
                    });
            }

            const msg = {
                to: user.email, // Change to your recipient
                from: 'marzuk777@gmail.com', // Change to your verified sender
                subject: 'Reset Password',
                text: 'Click Here',
                html: `
                    <p>You requested for password reset</p>
                    <h4><a href="http://localhost:3000/auth/reset-password/${token}" >Click Here</a> to reset password</h4>
                `,
            }
            sgMail.send(msg);

            req.flash("success", "Please check your email! This mail valid for next 15 minutes! ");
            return res.redirect('/auth/login');
        });

    } catch (error) {
        next(error);
    }
};

exports.newPasswordGetController = async (req, res, next) => {
    let token = req.params.token;
    let user = await User.findOne({ resetToken: token, expireToken: { $gt: Date.now()}});
    if (!user) {
        req.flash('fail', 'Link expired, Try again!');
        return res.render('pages/auth/resetPassword', {
            title: 'Reset Password',
            error: {},
            flashMessage: Flash.getMessage(req)
        });
    }
    res.render('pages/auth/newPassword', {
        title: 'New Password',
        error: {},
        token: req.params.token,
        flashMessage: {}
    })
}
exports.newPasswordPostController = async (req, res, next) => {
    let token = req.params.token;
    let errors = validationResult(req).formatWith(errorFormatter);

    if (!errors.isEmpty()) {

        return res.render("pages/auth/newPassword",
            {
                title: "New Password",
                error: errors.mapped(),
                flashMessage: {},
                token
            });
    }

    let { newPassword, confirmPassword } = req.body;
    if (token) {
        let user = await User.findOne({ resetToken: token, expireToken: { $gt: Date.now() } });
        if (!user) {
            req.flash('fail', 'Link expired, Try again!');
            return res.render('pages/auth/resetPassword', {
                title: 'Reset Password',
                error: {},
                flashMessage: Flash.getMessage(req)
            });
        }
        if (newPassword !== confirmPassword) {
            req.flash('fail', 'Password does not match');
            return res.render("pages/auth/newPassword", {
                title: "New Password",
                error: {},
                token,
                flashMessage: Flash.getMessage(req)
            });
        }

        try {
            let hash = await bcrypt.hash(newPassword, 12);

            await User.findOneAndUpdate(
                { _id: user._id },
                { $set: { password: hash, resetToken: undefined, expireToken: undefined } }
            );

            req.flash('success', 'New Password saved successfully');
            res.redirect("/auth/login");

        } catch (e) {
            next(e);
        }
    }
}

exports.logoutController = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            console.log(error);
            return next();
        }
        res.redirect("/auth/login");
    });
};