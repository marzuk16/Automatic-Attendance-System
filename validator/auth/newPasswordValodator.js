const { body } = require("express-validator");

module.exports = [

    body("newPassword")
        .notEmpty().withMessage("Please provide a password")
        .isLength({ min: 6 }).withMessage("Password must be greater than 6 character"),

    body("confirmPassword")
        .custom((confirmPassword, { req }) => {
            if (confirmPassword != req.body.newPassword) {
                throw new Error("Password does not match");
            }
            return true;
        }),

];