const { validationResult } = require("express-validator");
const Flash = require("../utils/Flash");

const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");

const errorFomatter = require("../utils/validationErrorFormatter");

exports.dashboardGetController = async (req, res, next) => {

    try {
        let profile = await Profile.findOne({ user: req.user._id });
        let courses = await Course.find({author: req.user._id});
        //console.log("course: ", courses);

        if (profile) {
            let { joinedClass } = profile;
           
            let myJoinedClass = [];
            for(let courseId of joinedClass){
                let tmp = await Course.findOne({_id: courseId})
                
                myJoinedClass.push(tmp);
            }
            //console.log("myJoinedClass: ", myJoinedClass);    
            
            return res.render("pages/dashboard/dashboard",
                {
                    title: "My Dashboard",
                    courses,
                    myJoinedClass,
                    userId: req.user.userId,
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

        res.render("pages/dashboard/create-profile",
            {
                title: "Create Your Profile",
                flashMessage: Flash.getMessage(req),
                error: {}
            });

    } catch (error) {
        next(error);
    }
};

exports.createProfilePostController = async (req, res, next) => {
    let errors = validationResult(req).formatWith(errorFomatter);
    //console.log("val error: ", errors.mapped());

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

    let institutions = ["BUET", "DU", "RU", "SUB"];
    let tmp = institutions[institute-1];

    let profilePics = req.user.profilePics;
    let courses = [];

    try {
        let profile = new Profile({
            user: req.user._id,
            institute: tmp,
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
    //console.log("Req: ", req);
    try {
        let profile = await Profile.findOne({user: req.user._id});
        if(!profile){
            return res.redirect("/dashboard/create-profile");
        }

        res.render("pages/dashboard/edit-profile", {
            title: "Edit Your Profile",
            flashMessage: Flash.getMessage(req),
            profile,
            error: {}
        });

    } catch (error) {
        next(error);
    }
};

exports.editProfilePostController = async (req, res, next) => {
    let errors = validationResult(req).formatWith(errorFomatter);
    //console.log("val error: ", errors.mapped());
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

    let institutions = ["BUET", "DU", "RU", "SUB"];
    let tmp = institutions[institute-1];

    try {
/*         let profile = new Profile({
            institute: tmp,
            name
        }); */

        let updatedProfile = await Profile.findOneAndUpdate(
            {user: req.user._id},
            {$set: {institute: tmp, name: name}},
            {new: true}
        );

        let updatedUser = await User.findOneAndUpdate(
            {_id: req.user._id},
            {$set: {email: email}},
            {new: true}
        );
        
        console.log("UpdatedUser: ", updatedUser);
        //console.log("updatedProfile: ", updatedProfile);

        req.flash("success", "Update Successfull");

        res.render("pages/dashboard/edit-profile", {
            title: "Edit Your Profile",
            flashMessage: Flash.getMessage(req),
            profile: updatedProfile,
            user: updatedUser,
            error: {}
        });

    } catch (error) {
        next(error);
    }
};
