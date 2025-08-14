const express = require("express");
const router = express.Router();


const {
    login,
    signup,
    sendotp,
    changePassword,
} = require("../controllers/Auth");

const {auth } = require("../middlewares/auth");

router.post("/login", login);
router.post("/signup", signup);
router.post("/send-otp", sendotp);
router.post("/change-password",auth, changePassword);



module.exports = router;