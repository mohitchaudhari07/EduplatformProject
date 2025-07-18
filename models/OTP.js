const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "5m", // OTP will expire in 5 minutes
  },
});

//function for email send

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyNotion: ",
      otp,
    );
    console.log("Email sent Successfully: " , mailResponse);
  } catch (error) {
    console.log("error occured while sending mails: ", error);
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  
    try {
      await sendVerificationEmail(this.email, this.otp);
      console.log("OTP sent to email:", this.email);
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return next(error); // Pass the error to the next middleware
    }
  
  next(); // Proceed to save the document
})

module.exports = mongoose.model("OTP", OTPSchema);
