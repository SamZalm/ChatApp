const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
    "username": {
        type: String,
        required: true,
        unique: true
    },
    "email": {
        type: String,
        required: true,
        unique : true
    },
    "password": {
        type: String,
        required: true,
    },
    "profilePicture": {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?20200418092106",
    },
    "conversations": [{
        type: Schema.Types.ObjectId,
        ref: 'conversation'
    }]
}, {
    versionKey: false
});

const UserModel = mongoose.model("user", UserSchema, "users");

module.exports = UserModel;