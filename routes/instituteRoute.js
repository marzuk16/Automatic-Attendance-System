const router = require("express").Router();

const { 
    addInstituteGetController,
    addInstitutePostController,
} = require("../controllers/addInstituteController");

router.get("/add", addInstituteGetController);
router.post("/add", addInstitutePostController);

module.exports = router;