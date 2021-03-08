const router = require("express").Router();

const {isAuthenticated} = require("../middleware/authMiddleware");

const joinClassValidator = require("../validator/dashboard/joinClassValidator");
const courseValidator = require("../validator/dashboard/courseValidator");

const {
    createCourseGetController,
    createCoursePostController,
    takeAttendanceGetController,
    joinClassPostController
} = require("../controllers/courseController");

router.get("/create", isAuthenticated, createCourseGetController);
router.post("/create", isAuthenticated, courseValidator, createCoursePostController);

router.get("/take-attendance/:courseId",
    isAuthenticated, 
    takeAttendanceGetController
);

router.post("/join", isAuthenticated, joinClassValidator, joinClassPostController);

module.exports = router;