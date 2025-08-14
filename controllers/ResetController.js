const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//reset password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const token = crypto.randomUUID();

    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000, // 1 hour
      },
      { new: true }
    );

    const resetUrl = `http://localhost:3000/resetpassword/${token}`;

    await mailSender({
      email: user.email,
      "Password Reset Link": resetUrl,
      subject: "Password Reset Link",
    });

    return res
      .status(200)
      .json({ success: true, message: "Reset link sent to your email" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//Reset Password

exports.resetPassword = async (req, res) => {
  try {
    //data fetch from request body
    const { password, confirmPassword, token } = req.body;

    //Validate the data
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password and Confirm Password does not match",
        });
    }

    //get user deatils from db using token
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    //check if token is expired or not
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Token expired , Please Regenarate your token",
        });
    }

    //hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //update the password in db
    await User.findOneAndUpdate(
      { token: token },
      {
        password: hashedPassword,
        token: null,
        resetPasswordExpires: null,
      },
      { new: true }
    );

    //return response
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
