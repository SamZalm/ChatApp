const router = require("express").Router();
const authBl = require("../BLs/authBl")

router.get("/me", async (req, res) => {
    let token = req.headers["x-access-token"];
    let response = await authBl.getUserDetailsFromToken(token);
    res.send(response);
});
router.post("/register", async (req, res) => {
    let userData = req.body;
    let response = await authBl.registerUser(userData);
    res.send(response);
});
router.post("/login", async (req, res) => {
    let userData = req.body;
    console.log("attempted login")
    let response = await authBl.loginUser(userData);
    res.send(response);
}); 

module.exports = router;