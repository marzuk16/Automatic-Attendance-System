// Name, Email, Message

const { Schema, model } = require("mongoose");

const schemaObj = {
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    message: {
        type: String,
        trim: true,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
};

const contactUsSchema = new Schema(schemaObj, { timestamps: true });
const ContactUs = model("ContactUs", contactUsSchema);

module.exports = ContactUs;