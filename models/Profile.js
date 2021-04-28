// User, Name, Institute, profilePic

const { Schema, model } = require("mongoose");

//const User = require("./User");
//const Course = require("./Course");

const schemaObj = {
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    institute: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    profilePics: String,
    course:[{
        //my created courses
        type: Schema.Types.ObjectId,
        ref: "Course"
    }],
    joinedClass: [{
        type: Schema.Types.ObjectId,
        ref: "Course"
    }],
    status: {
        type: Boolean,
        default: true
    }

};

const userSchema = new Schema(schemaObj, { timestamps: true });

const Profile = model("Profile", userSchema);

module.exports = Profile;