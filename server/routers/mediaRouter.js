const router = require("express").Router();
const fileUpload = require("../configs/fileUpload")
require("dotenv").config();

router.post('/upload', fileUpload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Image uploaded successfully, respond back with the new url
    res.send(`http://${process.env.DOMAIN}:${process.env.PORT}/api/media/uploads/${req.file.filename}`);
});

module.exports = router; 