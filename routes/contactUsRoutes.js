const router = require("express").Router();

const contactUsValidator = require("../validator/contactUsValidator");

const { 
    contactUsGetController,
    contactUsPostController
} = require("../controllers/contactUsController");

router.get("/", contactUsGetController);
router.post("/", contactUsValidator, contactUsPostController);

module.exports = router;