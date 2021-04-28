// course name, course code, 

const { Schema, model } = require("mongoose");

const schemaObj = {
    title: {
        type: String,
        maxlength: 30,
        trim: true,
        required: true,
        lowercase: true
    },
    code: {
        type: String,
        maxlength: 30,
        trim: true,
        required: true,
        lowercase: true
    },
    batch: {
        type: String,
        maxlength: 10,
        trim: true,
        required: true,
        lowercase: true
    },
    term: {
        type: String,
        maxlength: 15,
        trim: true,
        required: true,
        lowercase: true
    },
    joiningCode: {
        type: String,
        trim: true,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    joinedStudent: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    attendance: {
        type: Schema.Types.ObjectId,
        ref: "Attendance"
    },
    status: {
        type: Boolean,
        default: true
    }
};

const courseSchema = new Schema(schemaObj, { timestamps: true });
const Course = model("Course", courseSchema);

module.exports = Course;