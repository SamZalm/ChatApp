const router = require("express").Router();
const chatBl = require("../BLs/chatBl");

router.get("/", async (req, res) => {
    let token = req.headers["x-access-token"];
    let response = await chatBl.getUserConversations(token);
    res.send(response);
});

router.post("/new", async (req, res) => {
    let token = req.headers["x-access-token"];
    let { participants } = req.body
    let response = await chatBl.createConversation(token, participants);
    res.send(response);
});

router.get("/messages/:id/:page", async (req, res) => {
    let token = req.headers["x-access-token"];
    let convId = req.params.id;
    let page = req.params.page ? req.params.page : 1;
    let response = await chatBl.getMessages(token, convId, page);
    res.send(response);
});

// Removed: relevant db code was combined with socket code
/*
router.post("/edit-message/:id", async (req, res) => {
    let token = req.headers["x-access-token"];
    let msgId = req.params.id;
    let { content } = req.body
    let response = await chatBl.editMessage(token, msgId, content);
    res.send(response);
});

router.post("/delete-message/:id", async (req, res) => {
    let token = req.headers["x-access-token"];
    let msgId = req.params.id;
    let response = await chatBl.deleteMessage(token, msgId);
    res.send(response);
});
*/

module.exports = router;