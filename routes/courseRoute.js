const router = require("express").Router();

const joinClassValidator = require("../validator/dashboard/joinClassValidator");
const courseValidator = require("../validator/dashboard/courseValidator");
const { isAuthenticated } = require("../middleware/authMiddleware");

const {
    createCourseGetController,
    createCoursePostController,
    myAttendanceGetController,
    takeAttendanceGetController,
    takeAttendancePostController,
    updateAttendancePostController,
    joinClassPostController,
    exportAttendanceGetController
} = require("../controllers/courseController");

router.get("/create", isAuthenticated, createCourseGetController);
router.post("/create", isAuthenticated, courseValidator, createCoursePostController);

router.get("/take-attendance/:courseId", isAuthenticated, takeAttendanceGetController);
router.post("/take-attendance/:courseId", isAuthenticated, takeAttendancePostController);

router.get("/take-attendances/:courseId", 
    isAuthenticated,
    myAttendanceGetController
);

router.post("/attendance/update/:courseId", isAuthenticated, updateAttendancePostController
);

router.post("/join", isAuthenticated, joinClassValidator, joinClassPostController);

router.get("/attendances/export/:courseId", isAuthenticated, exportAttendanceGetController);

module.exports = router;