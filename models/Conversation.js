// course id, body, sender, status

const { Schema, model } = require("mongoose");

const schemaObj = {
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    sender: {
        id: Schema.Types.ObjectId,
        name: String,
        profilePics: String
    },
    message: String,
    date_time: {
        type: Date,
        default: Date.now,
      },
    status: {
        type: Boolean,
        default: true
    }
};

const conversationSchema = new Schema(schemaObj, { timestamps: true });
const Conversation = model("Conversation", conversationSchema);

module.exports = Conversation;