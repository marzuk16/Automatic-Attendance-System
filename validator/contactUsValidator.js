const { body } = require("express-validator");

module.exports = [
    body("name")
        .not().isEmpty().withMessage("Please Provide Your Name"),
    body("email")
        .isEmail().withMessage("Please Provide an email")
        .normalizeEmail(),
    body("message")
        .not().isEmpty().withMessage("Please Provide Your Message"),

];