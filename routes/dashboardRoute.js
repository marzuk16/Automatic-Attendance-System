const router = require("express").Router();

const profileValidator = require("../validator/dashboard/profileValidator");
const { isAuthenticated } = require("../middleware/authMiddleware");


const { 
    dashboardGetController,
    getProfileConroller,
    createProfileGetController,
    createProfilePostController,
    editProfileGetController,
    editProfilePostController
} = require("../controllers/dashboardController");


router.get("/", isAuthenticated, dashboardGetController);

router.get("/profile/:userId", isAuthenticated, getProfileConroller);

router.get("/create-profile", isAuthenticated, createProfileGetController);
router.post("/create-profile", isAuthenticated, profileValidator, createProfilePostController
);

router.get("/edit-profile", isAuthenticated, editProfileGetController);
router.post("/edit-profile", isAuthenticated, profileValidator, editProfilePostController
);


module.exports = router;