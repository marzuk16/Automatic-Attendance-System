// course id, body, sender, status

const { Schema, model } = require("mongoose");

const schemaObj = {
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    body: String,
    status: {
        type: Boolean,
        default: true
    }
};

const conversationSchema = new Schema(schemaObj, { timestamps: true });
const Conversation = model("Conversation", conversationSchema);

module.exports = Conversation;