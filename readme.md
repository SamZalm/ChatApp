## About The Project
This is a Real-time chat application built with React and NodeJS that contains the following features:

= Core Messaging & Real-Time
* Real-Time Messaging: Instantly send and receive private messages using Socket.IO.
* Message History: Automatic loading of past conversation history upon opening a chat.
* Connection Management: Real-time tracking and handling of user connect/disconnect events on the server.
* Message Editing: Users have the ability to edit their own sent messages.
* Message Deletion: Users have the option to delete their own sent messages.
* Group Chats: Ability to participate in multi-user conversations.
* Responsive Design: Optimized layout for various screen sizes using TailwindCSS or Material UI.

User & Data Management
* Authentication: Secure Register and Log-in flow with user verification using JSON Web Tokens (JWT).
* Media Upload: Support for uploading and viewing profile pictures within the chat (handling media uploads on the server).
* Contact List: A dedicated main screen displaying the user's list of active conversations.
* Database Persistence: Messages are saved securely in a MongoDB database (managed via Mongoose models).


## Prerequisites
You will need the following installed on your machine:
* Node.js (LTS version recommended)
* npm or yarn
* A running MongoDB instance (local or remote).
Windows users may install MongoDB using the following command:
```sh
winget install MongoDB.Server
```

## Installing
* Clone the repository:
```sh
git clone https://github.com/SamZalm/ChatApp.git
cd ChatApp
```

* Setup Backend (Server)
```sh
cd server
npm install
```

Modify the .env file in the server directory and add your connection string

Start the server:
```sh
node main.js
```

* Setup Frontend (Client)
```sh
cd ../client
npm install
```

Start the client application:
```sh
npm run dev
```

## Routes
* Endpoint that do not require a valid token in order to proceed:
# api/auth/register (POST) - registers a user
# api/auth/login (POST) - login endpoint
# api/media/uploads/{image file name} (GET) - returns the image with the corresponding file name.
# api/media/upload/ (POST) - accepts image files and uploads them. returns the url of the uploaded image.

* Endpoints that require a valid token in order to proceed:
# api/auth/me (GET) - returns some basic information about the user currently logged in (id, username, profile picture)
# api/chat/ (GET) - returns an array of conversations for the current user.
# api/chat/messages/:id/:page (GET) - returns an array (in json) of the last 100 messages sent in a matching conversation (id). only works if the user listed as a participant. for the next 100 messages (older), increase the value of 'page' by 1.
