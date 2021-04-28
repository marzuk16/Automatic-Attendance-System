const { body } = require("express-validator");

const User = require("../../models/User");

module.exports = [

    body("userId")
        .isLength({ min: 1 }).withMessage("Please Provide an ID")
        .custom(async userId => {
            let user = await User.findOne({ userId });
            if (user) {
                return Promise.reject("ID already taken");
            }
        })
        .trim(),

    body("email")
        .isEmail().withMessage("Please Provide an email")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Please provide a password")
        .isLength({ min: 6 }).withMessage("Password must be greater than 6 character"),

    body("cPassword")
        .custom((cPassword, { req }) => {
            if (cPassword != req.body.password) {
                throw new Error("Password does not match");
            }
            return true;
        }),
];