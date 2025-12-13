const jwt = require("jsonwebtoken")
const UserModel = require("../models/usersModel")
//const sendEmail = require("../configs/sendEmail")

const getAllUsersData = async (token) => {
    if (token) {
        try {
            return jwt.verify(
                token,
                process.env.SECRET_KEY_TOKEN, async (error, data) => {
                    if (error) {
                        return error;
                    } else {
                        try {
                            return UserModel.find({});
                        } catch (error) {
                            return "error reading users : " + error.message;
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

const getAllUsers = async (token) => {
    if (token) {
        try {
            let usersData = await getAllUsersData(token);
            let users = usersData.map(user => ({
                id: user._id,
                username: user.username,
                profilePicture: user.profilePicture
            }))
            return JSON.stringify(users);
        } catch (error) {
            return error.message
        }
    } else {
        return "Token not provided!"
    }
}

/*
const forgotPassword = async (username) => {
    try {
        let user = await UserModel.findOne({ username })
        if (user) {
            let tempToken = require("jsonwebtoken").sign(
                {
                    email: user.email
                },
                process.env.SECRET_KEY_TOKEN,
                {
                    expiresIn: 1000 * 60 * 5
                }
            )
            sendEmail(
                user.email,
                "reset Password",
                `
                    <p>Please Click the link below to reset your password!</p>
                    <div>
                        <a href="http://${process.env.DOMAIN}:${process.env.PORT}/forgotpassword/${tempToken}">Click</a>
                    </div>
                `
            )
            return "Email for reset sent to the user's address!"
        } else {
            return "user Not Found!"
        }
    } catch (error) {
        return error.message;
    }
}

const updateUserPassword = async (token , password) => {
    if (token) {
        try {
            return jwt.verify(
                token,
                "SHHH_SECRET_KEY", async (error, data) => {
                    if (error) {
                        return error;
                    } else {
                        console.log(data.email)
                        try {
                            let user = await UserModel.findOne({ email: data.email });
                            if (user) {
                                try {
                                    let newPassword = await require("bcrypt").hash(
                                        password, 10
                                    );
                                    try {
                                        await UserModel.findByIdAndUpdate(user._id, { password: newPassword });
                                        return "Password Updated!"
                                    } catch (error) {
                                        return error.message
                                    }
                                } catch (error) {
                                    return error.message
                                }
                            } else {
                                return "User not found! could not complete the update!"
                            }
                        } catch (error) {
                            return "error reading user : " + error.message;
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
*/

module.exports = {
    getAllUsers,
    /*
    forgotPassword,
    updateUserPassword
    */
}