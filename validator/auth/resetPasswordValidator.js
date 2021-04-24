const { body } = require("express-validator");

module.exports = [

    body("userId")
        .notEmpty().withMessage("Please provide a user id")

];