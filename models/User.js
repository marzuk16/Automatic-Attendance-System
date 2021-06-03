// Name, Id, Email, Password, Profile Pics, Course

const { Schema, model } = require("mongoose");

//const Profile = require("./Profile");

const schemaObj = {
    userId: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    resetToken: String,
    expireToken: Date,
    profilePics: {
        type: String,
        default: "/uploads/default.jpg"
    },
    profile:{
        type: Schema.Types.ObjectId,
        ref: "Profile"
    },
    status: {
        type: Boolean,
        default: true
    },
    sampleImage: {
        type: String,
        default: "/uploads/default.jpg"
    }
};

const userSchema = new Schema(schemaObj, { timestamps: true });
const User = model("User", userSchema);

module.exports = User;