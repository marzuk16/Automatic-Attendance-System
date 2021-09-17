const { validationResult } = require("express-validator");

const xlsx = require("xlsx");
const path = require("path");

const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const Profile = require("../models/Profile");
const User = require("../models/User");

const Flash = require("../utils/Flash");
const errorFormatter = require("../utils/validationErrorFormatter");
const { findOne } = require("../models/User");
const { info } = require("console");


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

    let errors = validationResult(req).formatWith(errorFormatter);

    let { title, code, batch, term } = req.body;

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
        lastMessageUpdate: Date.now()
    });

    try {
        //check this course exits or not
        let hasCourse = await Course.findOne(
            { user: req.user._id, code, batch, term }
        );
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

exports.editCourseGetController = async (req, res, next) => {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");

    let courseId = req.params.courseId;
    try {
        let course = await Course.findOne({ _id: courseId });

        if (!course) {
            req.flash("fail", "Course not found!");
            return res.redirect("/dashboard");
        }

        let { joinedStudent } = course;

        let studentsList = [];

        for (let student of joinedStudent) {
            let info = {
                _id: student
            }; 
            let tmp = await Profile.findOne({user: student});
            info.name = tmp.name;
            tmp = await User.findOne({_id: student});
            info.userId = tmp.userId;

            studentsList.push(info);
        }

        // console.log("studentsList", studentsList);

        res.render("pages/dashboard/course/editCourse", {
            title: "Edit course",
            error: {},
            flashMessage: Flash.getMessage(req),
            value: course,
            studentsList
        });

    } catch (error) {
        next(error);
    }
}

exports.editCoursePostController = async (req, res, next) => {
    console.log("edit", req.body);

    let errors = validationResult(req).formatWith(errorFormatter);

    let { title, code, batch, term } = req.body;
    let { courseId } = req.params;
    console.log("courseId params: ", req.params);

    let studentsList = [];
    let course = await Course.findOne({ _id: courseId });
        let { joinedStudent } = course;

        for (let student of joinedStudent) {
            let info = {
                _id: student
            }; 
            let tmp = await Profile.findOne({user: student});
            info.name = tmp.name;
            tmp = await User.findOne({_id: student});
            info.userId = tmp.userId;

            studentsList.push(info);
        }

    if (!errors.isEmpty()) {
        
        return res.render("pages/dashboard/course/editCourse", {
            title: "Edit course",
            error: errors.mapped(),
            flashMessage: Flash.getMessage(req),
            value: {
                title,
                code,
                batch,
                term
            },
            studentsList
        });
    }

    try {
        //check this course exits or not
        let ownCourse = await Course.findOne({_id: courseId, author: req.user._id});

        if ( !ownCourse) {
            req.flash("fail", "Invalid request");
            return res.redirect("/dashboard");
        }

        let hasCourse = await Course.findOne(
            { author: req.user._id, title, code, batch, term }
        );

        if (hasCourse) {
            req.flash("fail",
                "This course already in your list, Please check your dashboard"
            );

            return res.render("pages/dashboard/course/editCourse", {
                title: "Edit course",
                error: errors.mapped(),
                flashMessage: Flash.getMessage(req),
                value: {
                    title,
                    code,
                    batch,
                    term
                },
                studentsList
            });
        }

        let updatedCourse = await Course.findByIdAndUpdate(courseId,
            {$set: {title, code, batch, term}},
            {new: true}
        );
        req.flash("success", "Course update successfull");

        return res.redirect(`/courses/edit-course/${updatedCourse._id}`);

    } catch (error) {
        next(error);
    }

}
exports.removeStudentFromCoursePostController = async (req, res, next) => {

    let {courseId, studentId} = req.params;

    try {

        await Profile.findOneAndUpdate({user: studentId},
            { $pull: { "joinedClass": courseId }}
        );

        await Course.findByIdAndUpdate(courseId,
            { $pull: { "joinedStudent": studentId }}
        );

        await Attendance.findOneAndRemove({course: courseId, studentId});

        req.flash("success", "Student remove successdfull");

        return res.redirect(`/courses/edit-course/${courseId}`);

    } catch (error) {
        next(error);
    }

}

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
        console.log("tmp1: ", tmp1.value);


        let present = 0, absent = 0;
        for(val of tmp1.value){

            // console.log("ispreent: ", val.isPresent);
            val.isPresent ? present++ : absent++ ;
        }


        let percentage = tmp1.value.length ? ((present * 100 ) / tmp1.value.length).toFixed(2) : 0;

        tmp1.value.push({present, absent, percentage});

        attendances.push(tmp1);
        console.log("tmp1: ", tmp1.value);
        
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

            tmp1 = tmp1?.toJSON();
            tmp1.userId = tmp.userId;

            let present = absent = 0;
            for(val of tmp1.value){

                // console.log("ispreent: ", val.isPresent);
                val.isPresent ? present++ : absent++ ;
            }

            let percentage = ((present * 100 ) / (present + absent)).toFixed(2);

            tmp1.value.push({present, absent, percentage});

            attendances.push(tmp1);
            // console.log("tmp1: ", tmp1);

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
/* exports.takeAttendancePostController = async (req, res, next) => {
    //localhost:3000/courses/take-attendance/id

    let courseId = req.params.courseId;
    if(req.body.action === "update"){
        return res.redirect(`/courses/take-attendance/${courseId}`);
    }

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");

    let course = await Course.findOne({ author: req.user._id, _id: courseId });
    let { joinedStudent } = course.toJSON();
 
    //code here
    console.log(req.body);
    let today = currentDay();
    
    console.log("Take Attendance", today);
    
    req.flash("success", "Today's attendance added.");
    return res.redirect(`/courses/take-attendance/${courseId}`);

}; */

exports.searchAttendancePostController = async (req, res, next) => {
    console.log("search: ", req.body);
    const {userId, date} = req.body;
    let attendances = [];
    let courseId = req.params.courseId;

    try {
        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile)
            return res.redirect("/dashboard/create-profile");

        let userid = await User.findOne({userId});
        let course = await Course.findOne({ author: req.user._id, _id: courseId });
        let { joinedStudent } = course.toJSON();

        if(!userId && !date){
            console.log("null");
            return res.redirect(`/courses/take-attendance/${courseId}`);
        }

        if(userId && date){
            console.log("user: ", userId, " date: ", date);
 
            attendances = await Attendance.findOne({course: courseId, studentId: userid});
            if(!attendances){
                req.flash("fail", " Data not found!");
                return res.redirect(`/courses/take-attendance/${courseId}`);
            }
            let flag = true;
            let present = absent = 0, x;

            for(let val of attendances.value){

                val.isPresent ? present ++ : absent ++;

                if(date == val.day){
                    flag = false;
                    console.log("matched");
                    x = {
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
                }
            }
            if(flag){
                req.flash("fail", " Data not found!");
                return res.redirect(`/courses/take-attendance/${courseId}`);
            }

            attendances = [];
            attendances.push(x);

            let percentage = ((present * 100 ) / (present + absent)).toFixed(2);
            attendances[0].value.push({present, absent, percentage});
            
        }else if(userId){

            attendances = [];
            let attendance = await Attendance.findOne({course: courseId, studentId: userid});
            
            if(!attendance){
                req.flash("fail", " Data not found!");
                return res.redirect(`/courses/take-attendance/${courseId}`);
            }

            let x = JSON.stringify(attendance);
            attendance = JSON.parse(x);

            attendance.userId = userId;

            let present = absent = 0;
            for(let item of attendance.value){

                item.isPresent ? present ++ : absent ++;
            }

            let percentage = ((present * 100 ) / (present + absent)).toFixed(2);
            attendance.value.push({present, absent, percentage});
            attendances.push(attendance);

        }else if(date){
            console.log("date: ", date);

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

                let present = absent = 0;

                for(let item of attendance.value){

                    item.isPresent ? present ++ : absent ++;
                }

                let percentage = ((present * 100 ) / (present + absent)).toFixed(2);

                let value = [];
                if(attendance.value[index]){
                    value.push(attendance.value[index]);
                    value.push({present, absent, percentage});

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
    } catch (error) {
        next(error)
    }
};
exports.addAttendancePostController = async (req, res, next) => {
    let attendances = [];
    let courseId = req.params.courseId;

    try {
        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile)
            return res.redirect("/dashboard/create-profile");

        let course = await Course.findOne({ author: req.user._id, _id: courseId });
        let { joinedStudent } = course.toJSON();

        attendances = [];
        
        for(let stdnt of joinedStudent){
            let attendancesBSON = await Attendance.findOneAndUpdate(
                {course: courseId, studentId: stdnt},
                {$push: {"value": 
                        {
                            day: currentDay(),
                            entryTime: "0",
                            isPresent: false
                        }
                    }
                },
                {new: true}
            );

            attendancesBSON = attendancesBSON.toJSON();
            tmp = await User.findOne({_id: attendancesBSON.studentId});
            attendancesBSON.userId = tmp.userId;
            
            let present = absent = 0;
            for(let item of attendancesBSON.value){

                item.isPresent ? present ++ : absent ++;
            }
            let percentage =  ((present * 100 ) / (present + absent)).toFixed(2);

            attendancesBSON.value.push({present, absent, percentage});

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
/* 
        req.flash("success", "Update successfull !");
        return res.redirect(`/courses/take-attendance/${courseId}`); */
    } catch (error) {
        next(error)
    }
};

exports.updateAttendancePostController = async (req, res, next) => {
    let updatedTable = req.body;
    if(updatedTable)
        console.log("up table:", updatedTable);

    try {

        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile)
            return res.redirect("/dashboard/create-profile");

        let courseId = req.params.courseId;

        let course = await Course.findOne({ author: req.user._id, _id: courseId });
        if(!course){
            req.flash("fail", "Course not found!");
            return res.redirect(`/dashboard`);
        }

        // userName,colName,isChecked
        for(let i = 0; i < updatedTable?.length; i++){

            let table = updatedTable[i];

            let user = await User.findOne({userId: table.userName});

            let attendance = await Attendance.findOne({course: courseId, studentId: user._id});
            if(attendance){
                attendance = attendance.toJSON();
                let value = attendance.value;

                for(let ind = 0; ind < value.length; ind++){
                    let val = value[ind];

                if(table.colName == val.day){
                    value[ind].isPresent = table.isChecked;
                }
                }

                let updatedValues = await Attendance.findOneAndUpdate(
                    {course: courseId, studentId: user._id},
                    {$set: {value}},
                    {new: true}
                );

                console.log("updatedValues: ", updatedValues);
            }
        }

        // req.flash("success", "Update successfull !");
        return res.redirect(`/courses/take-attendance/${courseId}`);

        /* return res.status(200).json({
            message: "Update success!"
        }); */
        
    } catch (error) {

        res.status(500).json({
            errors: {
              common: {
                msg: err.message,
              },
            },
          });
        
    }

    
    
};

exports.joinClassPostController = async (req, res, next) => {

    let errors = validationResult(req).formatWith(errorFormatter);

    if (!errors.isEmpty()) {
        req.flash("fail", "Join failed!");
        return res.redirect("/dashboard");
    }

    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile)
        return res.redirect("/dashboard/create-profile");
    
    let { sampleImage } = req.user;
    if(sampleImage === "/uploads/default.jpg"){
        
    }

    let joiningCode = req.body.joinCode;

    try {
        let course = await Course.findOne({joiningCode});
        if (!course) {
            req.flash("fail", "Join failed!");
            return res.redirect("/dashboard");
        }
        let courseId = course._id;
        if(course){

            if(course.author.toString() === req.user._id.toString()){

                req.flash("fail", "You can't join your own course.");
                return res.redirect("/dashboard");
            }

            for(let stdnt of course.joinedStudent){
                if(req.user._id.toString() === stdnt.toString()){

                    req.flash("fail", "Already joined.");
                    return res.redirect("/dashboard");
                }
            }
        }

        course = await Course.findOneAndUpdate(
            { joiningCode },
            { $push: { "joinedStudent": req.user._id } },
            { new: true }
        );

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

const exportExcel = (data, workSheetColumnNames, workSheetName, filePath) => {

    const workBook = xlsx.utils.book_new();
    const workSheetData = [
        workSheetColumnNames,
        ... data
    ];

    const workSheet = xlsx.utils.aoa_to_sheet(workSheetData);
    xlsx.utils.book_append_sheet(workBook, workSheet, workSheetName);
    xlsx.writeFile(workBook, path.resolve(filePath));

};

const exportDataToExcel = (dataMatrix, workSheetColumnNames, workSheetName, filePath) => {
    // console.log("dataMatrix: ", dataMatrix);
    const data = dataMatrix.map(x => {
    console.log("dataMatrix: ", x);

        let tmp = [x[0], 0], present = 0;
        
        for(let i = 1; i<x.length; i++) {

            if(x[i].isPresent){

                tmp.push(1);
                present ++;
            }else
                tmp.push(0);
        }
            // x[i].isPresent ? tmp.push(1) : tmp.push(0);
        let percentage = (x.length - 1 > 0 ) ? ((present * 100) / (x.length - 1) ).toFixed(2) : 0;

        tmp[1] = `${percentage} %`;

        return tmp;
    });
    console.log("tmp: ", data);
    exportExcel(data, workSheetColumnNames, workSheetName, filePath);
};

exports.exportAttendanceGetController = async (req, res, next) => {
    console.log("export clicked");

    let courseId = req.params.courseId;
    try {
        let profile = await Profile.findOne({ user: req.user._id });
        if (!profile)
            return res.redirect("/dashboard/create-profile");

        console.log("courseId: ", courseId);
        let course = await Course.findOne({ _id: courseId });
        if (!course) {
            req.flash("fail", "Invalid request");
            return res.redirect(`/courses/take-attendance/${courseId}`);
        }

        let { joinedStudent } = course;
        
        let data = [];

        for (let stdnt of joinedStudent) {
            let student = await User.findById({_id: stdnt});
            let attendance = await Attendance.findOne({
                course: courseId,
                studentId: stdnt
            });

            let tmp = [student.userId, ... attendance.value];
            
            data.push(tmp);
        }

        console.log("data: ", data);

        let workSheetColumnName = ['Id \\ Date', 'Percentage'];

        for(let i = 1; i<data[0].length; i++) 
            workSheetColumnName.push(data[0][i].day);

        let workSheetName = `${course.title}-${course.batch}-${course.term}`;
        let filePath = `public/outputFiles/${course.title}-${course.batch}-${course.term}.xlsx`;

        await exportDataToExcel(data, workSheetColumnName, workSheetName, filePath);

        return res.download(filePath, err => {
            console.log("download error: ", err);
        });
        
    } catch (error) {
        next(error);
    }
};