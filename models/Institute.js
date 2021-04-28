const { Schema, model } = require("mongoose");

const schemaObj = {
    name: {
        type: String,
        trim: true,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    value: Number

};

const instituteSChema = new Schema(schemaObj, { timestamps: true });

const Institute = model("Institute", instituteSChema);

module.exports = Institute;