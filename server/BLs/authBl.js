const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/usersModel");

const getUserFromToken = async (token) => {
    if (token) {
        try {
            return jwt.verify(
                token,
                process.env.SECRET_KEY_TOKEN, async (error, data) => {
                    if (error) {
                        return error;
                    } else {
                        try {
                            return await UserModel.findById(data.id);
                        } catch (error) {
                            return "error reading users: " + error.message;
                        }
                    }
                }
            )
        } catch (error) {
            return error.message
        }
    } else {
        return "Token not provided!"
    }
}

const getUserDetailsFromToken = async (token) => {
    if (token) {
        try {
            const userData = await getUserFromToken(token);
            let userDetails = {
                id: userData._id,
                username: userData.username,
                profilePicture: userData.profilePicture,
            };
            return JSON.stringify(userDetails);
        } catch (error) {
            return error.message
        }
    } else {
        return "Token not provided!"
    }
}

const registerUser = async (userData) => {
    try {
        let { username, password } = userData;
        const user = await UserModel.findOne({ username });
        if (user) {
            return "Username already taken!"
        } else {
            try {
                userData.password = await bcrypt.hash(password, 10);
                try {
                    let newDocument = new UserModel(userData)
                    await newDocument.save();
                    return "User Created!"
                } catch (error) {
                    return "Error with user creation: " + error.message
                }
            } catch (error) {
                return "Error with data encryption: " + error.message
            }
        }
    } catch (error) {
        return error.message
    }
}
const loginUser = async (userData) => {
    try {
        let { username, password } = userData;
        const user = await UserModel.findOne({ username });
        if (user) {
            let answer = await bcrypt.compare(password, user.password)
            if (answer) {
                let token = require("jsonwebtoken").sign(
                    {
                        username: user.username,
                        id: user._id
                    },
                    process.env.SECRET_KEY_TOKEN,
                    {
                        expiresIn: "4h"
                    }
                )
                return {
                    status: "success",
                    data: token
                }
            } else {
                return "Invalid Password!"
            }
        } else {
            return "User not found!"
        }
    } catch (error) {
        return error.message
    }
}

module.exports = {
    getUserFromToken,
    getUserDetailsFromToken,
    registerUser,
    loginUser,
}