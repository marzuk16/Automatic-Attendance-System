const router = require("express").Router();

const {
    signupGetController,
    signupPostController,
    loginGetController,
    loginPostController,
    changePasswordGetController,
    changePasswordPostController,
    logoutController
} = require("../controllers/authController");

const loginValidator = require("../validator/auth/loginValidator");
const signupValidator = require("../validator/auth/signupValidator");
const changePasswordValidator = require("../validator/auth/changePasword");


const { isAuthenticated, isUnAuthenticated } = require("../middleware/authMiddleware");

router.get("/signup", isUnAuthenticated, signupGetController);
router.post("/signup", signupValidator, isUnAuthenticated, signupPostController);

router.get("/login", isUnAuthenticated, loginGetController);
router.post("/login", loginValidator, isUnAuthenticated, loginPostController);

router.get('/change-password', isAuthenticated, changePasswordGetController);
router.post('/change-password', changePasswordValidator, isAuthenticated, changePasswordPostController);

router.get("/logout", logoutController);

module.exports = router;