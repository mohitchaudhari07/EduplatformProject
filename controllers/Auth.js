const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Profile = require('../models/Profile');
const sendEmail = require("../utils/mailSender");

//SendOTP function
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(400).json({ message: "User already exists" });
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("Otp Generated: ", otp);

    //Check if user already exists in OTP collection
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp: otp });
    }

    //Create an otp entry in DB
    const otpPayload = {
      email: email,
      otp: otp,
    };

    const otpEntry = await OTP.create(otpPayload);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log("Error in sendOTP: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Signup function

exports.signup = async (req, res) => {
  //data fetxh from request body
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //validate the data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    //2password match krlo
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password does not match",
      });
    }

    //check user already exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    //find Most recent otp
    const recentOtp = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    if (!recentOtp || recentOtp.length === 0) {
      return res.status(400).json({ success: false, message: "OTP not found" });
    } else if (recentOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    //Hash the Password
    const hashedPassword = await bcrypt.hash(password, 10);

    //entry create in the database

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      address: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      contactNumber,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    //Return the response
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log("Error in signup: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Login function

exports.login = async (req, res) => {
  try {
    //Get the data from request body
    const { email, password } = req.body;

    //Validate the data
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    //user exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res
        .status(400)
        .json({ message: "User does not exist , please Sign up first" });
    }

    //generate the token , after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined; //remove password from user object
      console.log("Token generated: ", token);

      //create the cookie
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.status(200).cookie("token", token, options).json({
        success: true,
        message: "Login successful",
        user,
        token,
      });
    } else {
      return res.status(400).json({ message: "Password is incorrect" });
    }
  } catch (error) {
    console.log("Error in login: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//ChangePassword function

exports.changePassword = async (req, res) => {
  try{
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    //validate the data
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    //check is old password is correct or not
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }
    //check is new password and confirm password are same or not  
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and Confirm password does not match",
      });
    }
    //update the password in DB
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    //email the user about the password change
    const emailSent = await sendEmail({
      email: user.email,
      subject: "Password Changed",
      message: `Your password has been changed successfully`,
    });
    if (!emailSent) {
      return res.status(500).json({ message: "Email not sent" });
    }







  }
  catch (error){
    console.log("Error in changePassword: ", error);
    return res.status(500).json({ message: "Internal server error" });  

  }
}

