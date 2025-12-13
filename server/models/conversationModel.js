const mongoose = require("mongoose");
const { Schema } = mongoose;

const ConversationSchema = new mongoose.Schema({
    "name": {
        type: String,
        require: true,
    },
    "picture": {
        type: String,
        default: "https://cdn.pixabay.com/photo/2012/04/15/21/57/bubble-35458_1280.png",
    },
    "participants": [{
        type: Schema.Types.ObjectId,
        ref: 'user',
    }],
    "messages": [{
        type: Schema.Types.ObjectId,
        ref: 'message'
    }]
}, {
    timestamps: true
});

const ConversationModel = mongoose.model("conversation", ConversationSchema, "conversations");

module.exports = ConversationModel;