const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentTemplate,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//capture the payment
exports.capturePayment = async (req, res) => {
  //get the courseId and userId from the request body
  const { course_Id } = req.body;
  const userId = req.user.id;

  //Validation
  //Valid courseId
  if (!course_Id) {
    return res.json({
      success: false,
      message: "please provide valid course id",
    });
  }

  //valid courseDetails

  let course;
  try {
    course = await Course.findById(course_Id);
    if (!course) {
      return res.json({
        success: false,
        message: "Course not found",
      });
    }
    //user already pay for the same course
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.json({
        success: false,
        message: "User already enrolled in this course",
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "Invalid course id",
    });
  }

  //order create
  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100, //amount in paisa
    currency: currency,
    receipt: `receipt_${Math.random() * 1000000}`,
    notes: {
      courseId: course_Id,
      userId: userId,
    },
  };
  //initialize payment

  try {
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    //return response
    return res.json({
      success: true,
      message: "Order created successfully",
      data: paymentResponse,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount, //convert to rupees
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error creating order",
    });
  }
};

//Verify Signature of Razorpay Payment And Server

exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";
  const signature = req.headers["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === signature) {
    console.log("payment authorized ");
    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $addToSet: { studentsEnrolled: userId } },
        { new: true }
      );
      console.log(enrolledCourse);

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "User not found or already enrolled",
        });
      }

      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );
      console.log(enrolledStudent);

      if (!enrolledStudent) {
        return res.status(500).json({
          success: false,
          message: "User not found or already enrolled",
        });
      }

      // Send enrollment email
      mailSender.sendMail({
        to: enrolledStudent.email,
        subject: "Course Enrollment Successful",
        html: courseEnrollmentTemplate(enrolledStudent, enrolledCourse),
      });

      return res.status(200).json({
        success: true,
        message: "Payment successful and user enrolled",
      });
    } catch (error) {
      console.log("Error enrolling user:", error);
    }
  }
};
