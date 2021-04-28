const { validationResult } = require("express-validator");
const Flash = require("../utils/Flash");

const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const Institute = require("../models/Institute");

const errorFomatter = require("../utils/validationErrorFormatter");

exports.dashboardGetController = async (req, res, next) => {

    try {
        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            let { joinedClass } = profile;
            
            let myCreatedCourses = await Course.find({author: req.user._id});

            let myJoinedClass = [];
            for(let courseId of joinedClass){
                let tmp = await Course.findOne({_id: courseId})
                
                myJoinedClass.push(tmp);
            }

            return res.render("pages/dashboard/dashboard",
                {
                    title: "My Dashboard",
                    courses: myCreatedCourses,
                    myJoinedClass,
                    flashMessage: Flash.getMessage(req)
                });
        }
        
        res.redirect("/dashboard/create-profile");

    } catch (error) {
        next(error);
    }
};

exports.createProfileGetController = async (req, res, next) => {
    try {
        let profile = await Profile.findOne({ user: req.user._id });

        if (profile) {
            return res.redirect("/dashboard/edit-profile");
        }

        let institute = await Institute.find();

        res.render("pages/dashboard/create-profile",
            {
                title: "Create Your Profile",
                flashMessage: Flash.getMessage(req),
                error: {},
                institute
            });

    } catch (error) {
        next(error);
    }
};

exports.createProfilePostController = async (req, res, next) => {
    let errors = validationResult(req).formatWith(errorFomatter);

    if(!errors.isEmpty()){
        res.render("pages/dashboard/create-profile",{

            title: "Create Your Profile",
            flashMessage: Flash.getMessage(req),
            error: errors.mapped()
        });
    }

    let {
        institute,
        name,
        email
    } = req.body;

    if(institute == "0"){
        req.flash("fail", "Choose your Institution name");
        return res.redirect("/dashboard/create-profile");
    }
    let institutions = await Institute.findById({_id: institute});

    let profilePics = req.user.profilePics;
    let courses = [];

    try {
        let profile = new Profile({
            user: req.user._id,
            institute: institutions.name,
            name,
            profilePics,
            courses
        });


        let createdProfile = await profile.save();
        await User.findOneAndUpdate(
            {_id: req.user._id},
            {$set: {profile: createdProfile._id, email: email}}
        );
        
        req.flash("success", "Profile Created Success");
        res.redirect("/dashboard");

    } catch (error) {
        next(error);
    }
};


exports.editProfileGetController = async (req, res, next) => {
    try {
        let profile = await Profile.findOne({user: req.user._id});
        if(!profile){
            return res.redirect("/dashboard/create-profile");
        }

        let institutes = await Institute.find();

        res.render("pages/dashboard/edit-profile", {
            title: "Edit Your Profile",
            flashMessage: Flash.getMessage(req),
            profile,
            error: {},
            institutes
        });

    } catch (error) {
        next(error);
    }
};

exports.editProfilePostController = async (req, res, next) => {
    let errors = validationResult(req).formatWith(errorFomatter);

    let {
        institute,
        name,
        email
    } = req.body;

    if(!errors.isEmpty()){
        res.render("pages/dashboard/create-profile",{

            title: "Create Your Profile",
            flashMessage: Flash.getMessage(req),
            error: errors.mapped(),
            profile: {
                institute,
                name,
                email
            }
        });
    }

    try {

        let updateProfile = { name };
        if(institute != "0"){

            let institutions = await Institute.findById({_id: institute});
            updateProfile.institute = institutions.name;
        }

        let updatedProfile = await Profile.findOneAndUpdate(
            {user: req.user._id},
            {$set: updateProfile},
            {new: true}
        );

        let updatedUser = await User.findOneAndUpdate(
            {_id: req.user._id},
            {$set: {email: email}},
            {new: true}
        );

        let institutes = await Institute.find();

        req.flash("success", "Update Successfull");

        res.render("pages/dashboard/edit-profile", {
            title: "Edit Your Profile",
            flashMessage: Flash.getMessage(req),
            profile: updatedProfile,
            user: updatedUser,
            error: {},
            institutes
        });

    } catch (error) {
        next(error);
    }
};
