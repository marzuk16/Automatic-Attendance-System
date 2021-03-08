const { body } = require("express-validator");

module.exports = [
    body("userId")
        .not().isEmpty().withMessage("Please Provide Id"),
    body("password")
        .not().isEmpty().withMessage("Please Provide Password")
];