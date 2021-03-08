const {
    body
} = require('express-validator');
const validator = require("validator");

module.exports = [
    body("institute")
        .custom((value) => {
            if (value && value === "Choose Your Institute") {
                throw new Error("Please Choose Your Institute");
            }
            return true;
        }),
    body('name')
        .not().isEmpty().withMessage('Please Provide Your Name')
        .isLength({
            max: 50
        }).withMessage('Name can not be more than 50 character')
        .trim(),
    body("email")
        .isEmail().withMessage("Please Provide an email")
        .normalizeEmail(),
];