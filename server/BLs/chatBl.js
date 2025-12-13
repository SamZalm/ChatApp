//const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { getUserFromToken } = require("../BLs/authBl");

const ConversationModel = require("../models/conversationModel");
const MessageModel = require("../models/messageModel");
const UserModel = require("../models/usersModel");

const fetchConversationData = async (conversationId) => {
    try {
        let conversationData = await ConversationModel.findById(conversationId);
        return conversationData;
    } catch (error) {
        // Problem fetching last message. Ignore for now.
        return;
    }
}

const convertConversationDataToDetails = async (conversation) => {
    let result = {}
    if (!conversation.name) {
        // Every conversation requires a name, and it's always a string.
        // If it's missing, the argument passed is probably the id itself
        // Fetch the data to start working on it
        conversation = await fetchConversationData(conversation);
    }

    // Match id property
    result.id = conversation._id;
    result.name = conversation.name;
    result.picture = conversation.picture;
    
    // Get last message string and add it as a property
    result.lastMessage = "";
    if(conversation.messages && conversation.messages.length > 0) {
        let lastMsgId = conversation.messages[conversation.messages.length-1];
        try {
            let msgData = await MessageModel.findById(lastMsgId);
            result.lastMessage = msgData.content;
        } catch (error) {
            // Problem fetching last message. Ignore for now.
        }
    }

    // Arrange participants
    result.participants = [];
    for (let slot in conversation.participants) {
        let participantId = conversation.participants[slot];
        let userDetails = {
            id: participantId,
            username: "ERROR",
            profilePicture: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg?20200418092106",
        };
        try {
            let userData = await UserModel.findById(participantId);
            userDetails.username = userData.username;
            userDetails.profilePicture = userData.profilePicture;
        } catch (error) {
            // Ignore it for now, it will just send the default values.

        }
        result.participants.push(userDetails)
    }

    return result;
}

const fetchMessageData = async (messageId) => {
    try {
        let messageData = await MessageModel.findById(messageId);
        return messageData;
    } catch (error) {
        // Problem fetching last message. Ignore for now.
        return;
    }
}

const fetchUserData = async (userId) => {
    try {
        let userData = await UserModel.findById(userId);
        return userData;
    } catch (error) {
        // Problem fetching last message. Ignore for now.
        return;
    }
}

const getUserConversations = async (token) => {
    try {
        let user = await getUserFromToken(token);
        if (user.conversations) {
            // Convert user.conversations, an array of conversationIds to an array of conversationDetails
            let result = [];
            for (let slot in user.conversations) {
                let conversationId = user.conversations[slot];
                let conversationData = await convertConversationDataToDetails(conversationId);
                result.push(conversationData);
            }
            return JSON.stringify(result);
        } else {
            return user; // an error message
        }
    } catch (error) {
        return error.message
    }
}

const getConversationDetails = async (token, convId) => {
    try {
        let user = await getUserFromToken(token);
        let foundConversation = user.conversations.find(conversation => conversation._id == convId);
        if(!foundConversation) {
            return 'User does not have access to this conversation or it does not exist!'
        } else {
            let result = await convertConversationDataToDetails(foundConversation);
            return JSON.stringify(result);
        }
    } catch (error) {
        return error.message
    }
}

const createConversation = async (token, participants) => {
    try {
        if(participants.length < 1) {
            return 'A New conversation must include at least 2 users!';
        }

        // Get the user of the sender
        let user = await getUserFromToken(token);

        if(participants.length == 1 && participants[0].id == user._id) {
            // This shouldn't be possible, but just in case...
            return "You can't start a conversation with yourself!";
        }
        
        // Check if the passed arugment is an array containing user data
        // If it is, convert it into an array of user ids.
        if (participants[0].id) {
            participants = participants.map((participantData) => participantData.id);
        }
        participants.push(user._id);

        // Create a new conversation
        const conversationData = {
            name: "New Conversation",
            picture: null,
            participants: participants,
            messages: [],
        }
        const newDocument = new ConversationModel(conversationData)
        const newConversation = await newDocument.save();

        // Update every participants data with the new convId
        for (let slot in newConversation.participants) {
            let participantId = newConversation.participants[slot];
            try {
                await UserModel.findByIdAndUpdate(
                    participantId,
                    { $addToSet: { conversations: newConversation._id } }, // Only add if not already present
                    { new: true }
                );
            } catch (error) {
                // Unable to add user for some reason
                console.log(error.message);
            }
        }

        // Return the details of the new conversation
        let result = await convertConversationDataToDetails(newConversation);
        return JSON.stringify(result);
    } catch (error) {
        return error.message
    }
}

const getMessages = async (token, convId, page) => {
    try {
        let user = await getUserFromToken(token);
        let foundConversation = user.conversations.find(conversation => conversation._id == convId);
        if(!foundConversation) {
            return 'User does not have access to this conversation or it does not exist!'
        } else {
            // The user has access to this conversation. Get the details
            let conversationData = await fetchConversationData(convId);
            let newestFirst = conversationData.messages.reverse();
            try {
                let offset = (100 *(page-1));
                let messages = newestFirst.slice(offset + 0,99 + offset);
                let result = [];
                for (slot in messages) {
                    let messageId = messages[slot];
                    let messageData = await fetchMessageData(messageId);
                    let messageDetails = {
                        id: messageData._id,
                        content: messageData.content,
                        attachment: messageData.attachment,
                        timestamp: messageData.createdAt,
                        deleted: messageData.deleted,
                        version: messageData.__v
                    }

                    // fetch sender details
                    let senderData = await fetchUserData(messageData.sender);
                    let senderDetails = {
                        id: senderData._id,
                        username: senderData.username,
                        profilePicture: senderData.profilePicture
                    }
                    messageDetails.sender = senderDetails;
                    result.push(messageDetails);
                }
                return result;
            } catch (error) {
                return error.message
            }
        }
    } catch (error) {
        return error.message
    }
}

module.exports = {
    getUserConversations,
    getConversationDetails,
    createConversation,
    getMessages,
}