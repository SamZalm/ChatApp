const multer = require('multer');
const path = require('path');
require("dotenv").config();

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/'); // Store files in the uploads directory
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadFile = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit, more than enough.
    },
});

module.exports = uploadFile;