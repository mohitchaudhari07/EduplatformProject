const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication failed , token not found" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed , token not found",
    });
  }
};

//isStudent function

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res
        .status(403)
        .json({ message: "Access denied , you are not a student" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "User can not be verified" });
  }
};

//isInstructor function
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res
        .status(403)
        .json({ message: "Access denied , you are not a Instructor" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "User can not be verified" });
  }
};

//isAdmin function
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res
        .status(403)
        .json({ message: "Access denied , you are not a Admin" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "User can not be verified" });
  }
};
