const router = require("express").Router();
const usersBl = require("../BLs/usersBl")

router.get("/", async (req, res) => {
    let token = req.headers["x-access-token"];
    let response = await usersBl.getAllUsers(token);
    res.send(response);
});
/*
router.post("/newpassword/:token", async (req, res) => {
    let token = req.params.token; //req.headers["x-access-token"];
    let { password } = req.body
    let response = await usersBl.updateUserPassword(token, password);
    res.send(response);
});
*/

module.exports = router; 