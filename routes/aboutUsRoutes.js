const router = require("express").Router();


const { 
    aboutUsGetController
} = require("../controllers/aboutUsController");

router.get("/", aboutUsGetController);

module.exports = router;