const { getUserFromToken } = require("../BLs/authBl");

const ConversationModel = require("../models/conversationModel");
const MessageModel = require("../models/messageModel");
const UserModel = require("../models/usersModel");

const convertMessageDataToDetails = async (messageData) => {
    let result = {
        id: messageData._id,
        content: messageData.content,
        attachment: messageData.attachment,
        timestamp: messageData.createdAt,
        //sender: messageData.sender,
        deleted: messageData.deleted,
        version: messageData.__v
    }

    try {
        let senderData = await UserModel.findById(messageData.sender);
        let senderDetails = {
            id: senderData._id,
            username: senderData.username,
            profilePicture: senderData.profilePicture
        }
        result.sender = senderDetails;
    } catch (error) {
        console.log(error.message);
    }
    
    return result;
}

const createMessage = async (token, msgData, conversationId) => {
    try {
        let user = await getUserFromToken(token);
        let sender = user._id;
        try {
            // Add message to the db
            let messageData = {
                content: msgData.content,
                attachment: msgData.attachment,
                sender: sender,
                deleted: false,
            }
            const newDocument = new MessageModel(messageData)
            const newMsg = await newDocument.save();

            // Add message to the conversation
            try {
                await ConversationModel.findByIdAndUpdate(
                    conversationId,
                    { $addToSet: { messages: newMsg._id } }, // Only add if not already present
                    { new: true }
                );
                return newMsg;
            } catch (error) {
                // Unable to do that for some reason
                console.log(error.message);
            }
        } catch (error) {
            return "error reading messages: " + error.message;
        }
    } catch (error) {
        return error.message
    }
}

const editMessage = async(token, msgId, newContent) => {
    try {
        let user = await getUserFromToken(token);
        let userId = user._id;
        try {
            let foundMessage = await MessageModel.findById(msgId);
            if (foundMessage.sender.toString() != userId.toString()) {
                return "Access denied!"
            } else {
                // actually edit
                let updatedMsg = await MessageModel.findByIdAndUpdate(msgId, { content: newContent }, { new: true });
                return updatedMsg;
            }
        } catch (error) {
            return "error reading messages: " + error.message;
        }
    } catch (error) {
        return error.message
    }
}

const deleteMessage = async(token, msgId) => {
    try {
        let user = await getUserFromToken(token);
        let userId = user._id;
        try {
            let foundMessage = await MessageModel.findById(msgId);
            if (foundMessage.sender.toString() != userId.toString()) {
                return "Access denied!"
            } else {
                // actually edit
                let deletedMsg = await MessageModel.findByIdAndUpdate(msgId, { deleted: true }, { new: true });
                return deletedMsg;
            }
        } catch (error) {
            return "error reading messages: " + error.message;
        }
    } catch (error) {
        return error.message
    }
}

module.exports = {
    convertMessageDataToDetails,
    createMessage,
    editMessage,
    deleteMessage,
}