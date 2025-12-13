const jwt = require("jsonwebtoken");
require("dotenv").config()
const {convertMessageDataToDetails, createMessage, editMessage, deleteMessage} = require("./BLs/messageBl");

let onlineUsers = [];

// Middleware to authenticate socket connection
const authenticateSocket = (socket, next) => {
    const token = socket.handshake.query.token; // Extract the token from the query
    if (!token) {
        return next(new Error("Authentication error"));
    }

    jwt.verify(token, process.env.SECRET_KEY_TOKEN, (err, decoded) => {
        if (err) {
            return next(new Error("Authentication error"));
        }
        // Attach the user data to the socket object (can access this later in the event handlers)
        socket.user = decoded; // The decoded JWT token will contain the user's details
        next();
    });
};

const handleSocketEvents = async (socket, io) => {
    // After successful authentication, you can store the user’s data (user ID) with the socket ID
    const userId = socket.user.id;
    const username = socket.user.username;
    console.log(`User connected: ${username}#${socket.id}`);

    socket.on("set_active_conversation", conversationDetails => {
        // Become inactive in a different conversation


        // Handle joining to new room
        socket.join(conversationDetails.id);
        let conversation = onlineUsers.find(x => x.id == conversationDetails.id);
        
        if (conversation) {
            conversation.activeParticipants.push({
                username: username,
                userId: userId,
                id: socket.id
            });
        } else {
            onlineUsers.push({
                id: conversationDetails.id,
                activeParticipants: [{
                    username: username,
                    userId: userId,
                    id: socket.id
                }]
            });
        }

        console.log(`User ${username}#${socket.id} selected conversation: ${conversationDetails.name}#${conversationDetails.id}`);
    });

    socket.on("get_active_participants", (conversationId) => {
        socket.to(conversationId).emit("activeParticipants",
            onlineUsers.find(x => x.id == conversationId)?.activeParticipants || []
        );
    });

    socket.on("send_message", async (data) => {
        // Structure:
        // data = {content, attachment, "sender", "conversationId"}

        // Handle DB
        let msgData = {content: data.content, attachment: data.attachment}
        console.log(`${username}#${socket.id} sent '${msgData.content ? msgData.content : ""}' ${msgData.attachment ? ('(' + msgData.attachment + ')') : ""} in ${data.conversationId}`);
        let messageData = await createMessage(
            socket.handshake.query.token,
            msgData,
            data.conversationId
        );
        let result = await convertMessageDataToDetails(messageData);

        // Update current conversation with the new message data
        // Then update the entire server, notifying users of a new msg
        io.to(data.conversationId).emit("new_message", data.conversationId, result);
        io.emit("conversation_updated", data.conversationId, result.content ? result.content : (result.attachment || ""));
    });

    socket.on("edit_message", async (data) => {
        // Structure:
        // data = {"id", "content, attachment", "sender", "conversationId"}

        // Handle DB
        console.log(`${username}#${socket.id} edited message #${data.id} to '${data.content}' in ${data.conversationId}`);
        let messageData = await editMessage(
            socket.handshake.query.token,
            data.id,
            data.content
        );
        let result = await convertMessageDataToDetails(messageData);
        
        io.to(data.conversationId).emit("message_updated", data.conversationId, result);
    });

    socket.on("delete_message", async (data) => {
        // Structure:
        // data = {"id", "content, attachment", "sender", "conversationId"}

        // Handle DB
        console.log(`${username}#${socket.id} deleted message #${data.id} in ${data.conversationId}`);
        let messageData = await deleteMessage(
            socket.handshake.query.token,
            data.id
        );
        let result = await convertMessageDataToDetails(messageData);

        io.to(data.conversationId).emit("message_updated", data.conversationId, result); // basically the same
        
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${username}#${socket.id}`);
        onlineUsers.forEach((conversation) => {
            conversation.activeParticipants = conversation.activeParticipants.filter(user => user.id !== socket.id);
        });
    });
};

const setupSocket = (io) => {
    io.use(authenticateSocket);  // Authentication middleware
    io.on("connection", async (socket) => await handleSocketEvents(socket, io));
};

module.exports = { setupSocket };