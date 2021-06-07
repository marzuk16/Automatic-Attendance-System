const router = require("express").Router();

const joinClassValidator = require("../validator/dashboard/joinClassValidator");
const courseValidator = require("../validator/dashboard/courseValidator");
const { isAuthenticated } = require("../middleware/authMiddleware");

const {
    createCourseGetController,
    createCoursePostController,
    editCourseGetController,
    editCoursePostController,
    removeStudentFromCoursePostController,
    myAttendanceGetController,
    takeAttendanceGetController,
    takeAttendancePostController,
    searchAttendancePostController,
    addAttendancePostController,
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

router.get("/edit-course/:courseId", 
    isAuthenticated,
    editCourseGetController
);
router.post("/edit-course/:courseId", 
    isAuthenticated,
    courseValidator,
    editCoursePostController
);
router.post("/edit-course/remove-student/:courseId/student/:studentId",
    isAuthenticated,
    removeStudentFromCoursePostController
);

router.post("/attendances/search/:courseId",
    isAuthenticated,
    searchAttendancePostController
);
router.post("/attendances/add/:courseId",
    isAuthenticated,
    addAttendancePostController
);
router.post("/attendances/update/:courseId",
    isAuthenticated,
    updateAttendancePostController
);

router.post("/join", isAuthenticated, joinClassValidator, joinClassPostController);

router.get("/attendances/export/:courseId", isAuthenticated, exportAttendanceGetController);

module.exports = router;