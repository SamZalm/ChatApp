const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new mongoose.Schema({
    "content": {
        type: String,
        require: true,
    },
    "attachment": {
        type: String,
    },
    "sender": {
        type: Schema.Types.ObjectId,
        ref: 'user',
        //required : true // changed: no sender = system message?
    },
    "deleted": {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const MessageModel = mongoose.model("message", MessageSchema, "messages");

module.exports = MessageModel;