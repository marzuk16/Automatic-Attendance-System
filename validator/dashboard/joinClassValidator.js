const {
    body
} = require('express-validator');
const validator = require("validator");

module.exports = [
    body('joinCode')
        .not().isEmpty().withMessage('Please Provide Join Code')
        .trim()
];