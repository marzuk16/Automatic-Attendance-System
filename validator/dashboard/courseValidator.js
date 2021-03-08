const {body} = require("express-validator");

module.exports = [
    body("title")
        .not().isEmpty().withMessage("Please provide course name")
        .isLength({max: 30}).withMessage("Name Cant be greater than 30 leter")
        .trim()
    ,
    body("code")
        .not().isEmpty().withMessage("Please provide course code")
        .isLength({max: 30}).withMessage("Code Cant be greater than 30 leter")
        .trim()
    ,
    body("batch")
        .not().isEmpty().withMessage("Please provide batch")
        .isLength({max: 10}).withMessage("Code Cant be greater than 10 leter")
        .trim()
    ,
    body("term")
        .not().isEmpty().withMessage("Please provide term name")
        .isLength({max: 15}).withMessage("Term Cant be greater than 15 character")
        .trim()

];