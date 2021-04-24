const { validationResult } = require("express-validator");

const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const Profile = require("../models/Profile");
const User = require("../models/User");

const Flash = require("../utils/Flash");
const errorFormatter = require("../utils/validationErrorFormatter");


let currentDay = () => {
    let today = new Date();
    let date1 = today.getFullYear().toString() + '-';
    if(today.getMonth()+1 < 10) date1 += '0';
    date1 += today.getMonth()+1 + '-';

    if(today.getDate() < 10) date1 += '0';
    date1 += today.getDate().toString();

    return date1;
};

exports.createCourseGetController = async (req, res, next) => {
    //let courses = await Course.find({author: req.user._id});
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");

    res.render("pages/dashboard/course/createCourse", {
        title: "Create a new course",
        error: {},
        flashMessage: Flash.getMessage(req),
        value: {}
    });
};

exports.createCoursePostController = async (req, res, next) => {

    //let courses = await Course.find({author: req.user._id});

    let errors = validationResult(req).formatWith(errorFormatter);
    console.log("Errors: ", errors.mapped());

    let { title, code, batch, term } = req.body;
    // console.log("req.body: ", req.body);

    if (!errors.isEmpty()) {

        return res.render("pages/dashboard/course/createCourse", {
            title: "Create a new course",
            error: errors.mapped(),
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
            { user: req.user._id, code, batch, term }
        );
        // console.log("hasCourse: ", hasCourse);
        if (hasCourse) {
            req.flash("fail",
                "This course already in your list, Please check your dashboard"
            );

            return res.render("pages/dashboard/course/createCourse", {
                title: "Create a new course",
                error: errors.mapped(),
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
            { user: req.user._id },
            { $push: { "course": createdCourse._id } }
        );

        req.flash("success", "Course create success");

        return res.redirect(`/courses/take-attendance/${createdCourse._id}`);

    } catch (error) {
        next(error);
    }
};

exports.myAttendanceGetController = async (req, res, next) => {
    //localhost:3000/courses/take-attendances/id
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");

    let courseId = req.params.courseId;

    try {
        let course = await Course.findOne({ _id: courseId });

        if(course){
            let flag = false;
            for(let stdnt of course.joinedStudent ){
                if(stdnt.toString() === req.user._id.toString()){
                    flag = true;
                    break;
                }
            }
            if( !flag) course = null;
        }
        console.log("course: ", course);

        if (!course) {
            req.flash("fail", "Course not found!");
            return res.redirect("/dashboard");
        }

        let attendances = [];

        let tmp1 = await Attendance.findOne({ course: courseId, studentId: req.user._id});

        tmp1 = tmp1?.toJSON();
        tmp1.userId = req.user.userId;

        attendances.push(tmp1);

        res.render("pages/dashboard/course/take-attendance.ejs", {
            title: "Take Attendance",
            flashMessage: Flash.getMessage(req),
            error: {},
            value: {},
            course,
            attendances,
            attendance: attendances[0],
            add : true,
            owner : false
        });

    } catch (error) {
        next(error);
    }

};

exports.takeAttendanceGetController = async (req, res, next) => {
    //localhost:3000/courses/take-attendance/id
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");

    let courseId = req.params.courseId;

    try {
        let course = await Course.findOne({ author: req.user._id, _id: courseId });

        if (!course) {
            req.flash("fail", "Course not found!");
            return res.redirect("/dashboard");
        }

        let attendances = [];
        let tmp, tmp1;
        let { joinedStudent } = course;
        let add = false;
        let today = currentDay();

        for(let stdnt of joinedStudent){
            tmp = await User.findOne({_id: stdnt});
            tmp1 = await Attendance.findOne({ course: courseId, studentId:  stdnt});
            // console.log("att. value: ", tmp1.studentId);

            tmp1 = tmp1?.toJSON();
            tmp1.userId = tmp.userId;
            // console.log("att. value: ", tmp1.value);

            attendances.push(tmp1);

            if(!add){
                for(let val of tmp1.value){
                    if(today === val.day){
                        add = true;
                        break;
                    }
                }
            }
        }

        res.render("pages/dashboard/course/take-attendance.ejs", {
            title: "Take Attendance",
            flashMessage: Flash.getMessage(req),
            error: {},
            value: {},
            course,
            attendances,
            attendance: attendances[0],
            add,
            owner : true
        });

    } catch (error) {
        next(error);
    }

};
exports.takeAttendancePostController = async (req, res, next) => {
    //localhost:3000/courses/take-attendance/id

    let attendances = [];
    let courseId = req.params.courseId;

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");

    let course = await Course.findOne({ author: req.user._id, _id: courseId });
    let { joinedStudent } = course;

    if(req.body.action === "add"){

        attendances = await Attendance.findOne({course: courseId});
        
        for(let val of attendances.value){
            if(val.day === currentDay()){
                return res.redirect(`/courses/take-attendnace/${courseId}`);
                // return res.redirect("/courses/take-attendance/:courseId");
            }
        }
        let tmp = {
            day: currentDay(),
            entryTime: "0",
            isPresent: false
        };

        attendances = [];
        for(let stdnt of course.joinedStudent){
            let attendancesBSON = await Attendance.findOneAndUpdate(
                {course: courseId, studentId: stdnt},
                {$push: {"value": tmp}},
                {new: true}
            );

            attendancesBSON = attendancesBSON.toJSON();
            tmp = await User.findOne({_id: attendancesBSON.studentId});
            attendancesBSON.userId = tmp.userId;

            attendances.push(attendancesBSON);
        }

        return res.render("pages/dashboard/course/take-attendance.ejs", {
            title: "Take Attendance",
            flashMessage: {},
            error: {},
            value: {},
            course,
            add: true,
            attendances,
            owner : true
        });

    }    
    if (req.body.action === "update") {
        //code here
        console.log("update");
    }
    if (req.body.action === "Search") {
        // console.log("search");
        const {userId, date} = req.body;
        let userid = await User.findOne({userId});
        
        if(!userId && !date){
            return res.redirect(`/courses/take-attendance/${courseId}`);
        }
        if(userId && date){
            console.log("userId && date", date);
            attendances = await Attendance.findOne({course: courseId, studentId: userid});
            if(!attendances){
                req.flash("fail", " Data not found!");
                return res.redirect(`/courses/take-attendance/${courseId}`);
            }
            for(let val of attendances.value){
                if(date == val.day){
                    console.log("matched");
                    let x = {
                        course: attendances.course,
                        studentId: attendances.studentId,
                        userId,
                        value: [
                            {   day: date,
                                entryTime: val.entryTime,
                                isPresent: val.isPresent
                            }
                        ]
                    };

                    attendances = [];
                    attendances.push(x);
                }
            }
        }else if(userId){
            console.log("userId");
            attendances = [];
            attendances.push( await Attendance.findOne({course: courseId, studentId: userid}));
            if(!attendances[0]){
                req.flash("fail", " Data not found!");
                return res.redirect(`/courses/take-attendance/${courseId}`);
            }
            attendances[0].toJSON();
            attendances[0].userId = userId;
            // console.log("attendances: ", attendances.userId);
        }else if(date){
            console.log("date");
            let index = -1;
            attendances = [];
            for(let studentId of joinedStudent){
                let user = await User.findOne({_id: studentId});
                let attendance = await Attendance.findOne({course: courseId, studentId});
                
                if(index === -1){
                    for(let i = 0; i<attendance.value.length; i++){
                        if(date == attendance.value[i].day){
                            index = i;
                            break;
                        }
                    }
                }

                let value = [];
                if(attendance.value[index]){
                    value.push(attendance.value[index]);
                    let x = {
                        course: attendance.course,
                        studentId: attendance.studentId,
                        userId: user.userId,
                        value
                    };
                    
                    attendances.push(x);
                }
            }

            if(!attendances[0]){
                req.flash("fail", " Data not found!");
                return res.redirect(`/courses/take-attendance/${courseId}`);
            }
        }
        return res.render("pages/dashboard/course/take-attendance.ejs", {
            title: "Take Attendance",
            flashMessage: {},
            error: {},
            value: {},
            course,
            add: true,
            attendances,
            owner : true
        });
    }
    if (req.body.action === "takeAttendance") {
        //code here
        let today = currentDay();
        
        console.log("Take Attendance", today);
        return ;
    }

};

exports.joinClassPostController = async (req, res, next) => {

    // console.log("req: ", req.user);
    let errors = validationResult(req).formatWith(errorFormatter);

    if (!errors.isEmpty()) {
        req.flash("fail", "Join failed!");
        return res.redirect("/dashboard");
    }

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");

    let joiningCode = req.body.joinCode;

    try {
        let course = await Course.findOne({joiningCode});
        let courseId = course._id;
        if(course){
            for(let stdnt of course.joinedStudent){
                if(req.user._id.toString() === stdnt.toString()){
                    return res.redirect("/dashboard");
                }
            }
        }
        
        course = await Course.findOneAndUpdate(
            { joiningCode },
            { $push: { "joinedStudent": req.user._id } },
            { new: true }
        );
        if (!course) {
            req.flash("fail", "Join failed!");
            return res.redirect("/dashboard");
        }
        await Profile.findOneAndUpdate(
            { user: req.user._id },
            { $push: { "joinedClass": course._id } },
            { new: true }
        );
                
        let attendanceSheetObj = {
            course: course._id,
            studentId: req.user._id
        };

        let attendance = await Attendance.findOne({course: courseId});
        if(attendance){
            let value = [];
            attendance.toJSON();
            for(let val of attendance.value){
                val.isPresent = false;
                value.push(val);
            }
            attendanceSheetObj.value = value;
        }
        
        let attendanceSheet = new Attendance(attendanceSheetObj);
        await attendanceSheet.save();

        req.flash("success", "Join success");
        res.redirect("/dashboard");

    } catch (error) {
        next(error);
    }
};