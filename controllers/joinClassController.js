/* const {validationResult} = require("express-validator");

const Course = require("../models/Course");
const Profile = require("../models/Profile");

const Flash = require("../utils/Flash");
const errorFormatter = require("../utils/validationErrorFormatter");

exports.joinCourseGetController = (req, res, next) => {

    res.render("pages/dashboard/course/createCourse", {
        title: "Create a new course",
        error: {},
        flashMessage: Flash.getMessage(req),
        value: {}
    });
};

exports.joinClassPostController = async (req, res, next) => {

    let errors = validationResult(req).formatWith(errorFormatter);

    if(!errors.isEmpty()){

        req.flash("fail", "Join failed");
        returnres.redirect("/dashboard");
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
}; */