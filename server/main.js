const fs = require('fs');
const path = require('path');
const express = require("express");
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRouter = require("./routers/authRouter")
const usersRouter = require("./routers/usersRouter")
const chatRouter = require("./routers/chatRouter")
const mediaRouter = require("./routers/mediaRouter")
const { setupSocket } = require("./socket");
const app = express();
require("./configs/connectDB")();
require("dotenv").config() //set usage of .env file

// 'uploads' fix
const folderPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log('Folder "uploads" created!');
}

app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) => { 
    res.send("server is online and ready!")
});

app.use("/api/users", usersRouter); // Password reset, change profile pic.
app.use("/api/auth", authRouter); // Register, log-in.
app.use("/api/chat", chatRouter); // Conversations, message history.

app.use('/api/media/uploads', express.static('uploads')); // Get images.
app.use('/api/media', mediaRouter); // Upload images.

setupSocket(io);

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});