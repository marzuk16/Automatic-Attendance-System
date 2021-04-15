const router = require("express").Router();

const {indexGetController} = require("../controllers/indexController");

router.get("/", indexGetController);

module.exports = router;