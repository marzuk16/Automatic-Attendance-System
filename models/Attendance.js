// course name, course code, 

const { Schema, model } = require("mongoose");

const schemaObj = {
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    value: [{
        entryTime: Number,
        isPresent: Boolean
    }],
    day: String
};

const attendanceSchema = new Schema(schemaObj, { timestamps: true });
const Attendance = model("Attendance", attendanceSchema);

module.exports = Attendance;