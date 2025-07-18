const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // Replace with your SMTP server

      auth: {
        user: process.env.MAIL_USER, // Replace with your SMTP username
        pass: process.env.MAIL_PASS, // Replace with your SMTP password
      },
    });

    let info = await transporter.sendMail({
      from: "StudyNotion", // Sender address
      to: email, // List of recipients
      subject: title, // Subject line
      text: body, // Plain text body
      html: body, // HTML body content
    });
  } catch (error) {
    console.error("Error creating transporter:", error);
    throw new Error("Failed to create mail transporter");
  }
};
module.exports = mailSender;
