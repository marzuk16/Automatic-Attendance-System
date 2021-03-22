const {validationResult} = require("express-validator");

const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const Profile = require("../models/Profile");

const Flash = require("../utils/Flash");
const errorFormatter = require("../utils/validationErrorFormatter");

exports.createCourseGetController = (req, res, next) => {
    //let courses = await Course.find({author: req.user._id});

    res.render("pages/dashboard/course/createCourse", {
        title: "Create a new course",
        error: {},
        userId: req.user.userId,
        flashMessage: Flash.getMessage(req),
        value: {}
    });
};

exports.createCoursePostController = async (req, res, next) => {

    //let courses = await Course.find({author: req.user._id});

    let errors = validationResult(req).formatWith(errorFormatter);
    console.log("Errors: ", errors.mapped());

    let {title, code, batch, term} = req.body;
    console.log("req.body: ", req.body);
    
    if(!errors.isEmpty()){

        return res.render("pages/dashboard/course/createCourse", {
            title: "Create a new course",
            error: errors.mapped(),
            userId: req.user.userId,
            flashMessage: Flash.getMessage(req),
            value: {
                title,
                code,
                batch,
                term
            }
        });
    }

    let joiningCode = Math.random().toString(36).substr(2, 4);

    let course = new Course({
        title,
        code,
        batch,
        term,
        joiningCode,
        author: req.user._id,
    });

    try {
        //check this course exits or not
        let hasCourse = await Course.findOne(
            {user:req.user._id, code, batch, term}
        );
        console.log("hasCourse: ", hasCourse);
        if(hasCourse){
            req.flash("fail",
                "This course already in your list, Please check your dashboard"
            );

            return res.render("pages/dashboard/course/createCourse", {
                title: "Create a new course",
                error: errors.mapped(),
                userId: req.user.userId,
                flashMessage: Flash.getMessage(req),
                value: {
                    title,
                    code,
                    batch,
                    term
                }
            });
        }

        let createdCourse = await course.save();

        await Profile.findOneAndUpdate(
            {user: req.user._id},
            {$push: {"course": createdCourse._id}}
        );
        req.flash("success", "Course create success");

        return res.redirect(`/courses/take-attendance/${createdCourse._id}`);

    } catch (error) {
        next(error);
    }
};

exports.takeAttendanceGetController = async (req, res, next) => {
    //localhost:3000/courses/take-attendance/id
    let courseId = req.params.courseId;

    try {
        let course = await Course.findOne({author: req.user._id, _id: courseId});
        //let courses = await Course.find({author: req.user._id});


        if(!course){
            let error = new Error("404 Not Found!");
            error.status = 404;
            throw new Error
        }
        let isChecked = true;
        res.render("pages/dashboard/course/take-attendance.ejs", {
            title: "Take Attendance",
            userId: req.user.userId,
            flashMessage: Flash.getMessage(req),
            error: {},
            value: {},
            course,
            isChecked
        });

    } catch (error) {
        next(error);
    }

};

exports.joinClassPostController = async (req, res, next) => {

    let errors = validationResult(req).formatWith(errorFormatter);

    if(!errors.isEmpty()){

        req.flash("fail", "Join failed!");
        return res.redirect("/dashboard");
    }

    let joiningCode = req.body.joinCode;

    try {
        let course = await Course.findOne({joiningCode});
        await Profile.findOneAndUpdate(
            {user: req.user._id},
            {$push: {"joinedClass": course._id}},
            {new: true}
        );
        
        req.flash("success", "Join success");
        res.redirect("/dashboard");

    } catch (error) {
        next(error);
    }
};