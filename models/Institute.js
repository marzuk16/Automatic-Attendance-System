/* // Name, User

const { Schema, model } = require("mongoose");

const schemaObj = {
    name: {
        type: String,
        trim: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

};

const instituteSChema = new Schema(schemaObj, { timestamps: true });

const Institute = model("Institute", instituteSChema);

module.exports = Institute; */