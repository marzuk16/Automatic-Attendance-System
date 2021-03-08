/* const { request } = require("express");
const router = require("express").Router();

const { isAuthenticated } = require("../middleware/authMiddleware");
const joinClassValidator = require("../validator/dashboard/joinClassValidator");


const { 
    joinClassPostController
} = require("../controllers/joinClassController");


router.post("/join", isAuthenticated, joinClassValidator, joinClassPostController);

module.exports = router; */