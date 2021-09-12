const router = require("express").Router();

const profileValidator = require("../validator/dashboard/profileValidator");
const { isAuthenticated } = require("../middleware/authMiddleware");


const { 
    dashboardGetController,
    getProfileController,
    createProfileGetController,
    createProfilePostController,
    editProfileGetController,
    editProfilePostController,
    samplePictureGetController,
    samplePicturePostController
} = require("../controllers/dashboardController");


router.get("/", isAuthenticated, dashboardGetController);

router.get("/profile/:userId", isAuthenticated, getProfileController);

router.get("/create-profile", isAuthenticated, createProfileGetController);
router.post("/create-profile", isAuthenticated, profileValidator, createProfilePostController
);

router.get("/edit-profile", isAuthenticated, editProfileGetController);
router.post("/edit-profile", isAuthenticated, profileValidator, editProfilePostController);

router.get("/sample-picture", isAuthenticated, samplePictureGetController);
router.post("/sample-picture", isAuthenticated, samplePicturePostController);


module.exports = router;