const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create rating and review handler
exports.createRating = async (req, res) => {
  try {
    //get user id
    const userId = req.user.id;

    //fetchdata from req body
    const { courseId, rating, review } = req.body;

    //check if user is enrolled in the course
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    //check if user already rated the course
    const existingRating = await RatingAndReview.findOne({
      course: courseId,
      user: userId,
    });
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this course",
      });
    }

    //create a new rating and review
    const newRating = await RatingAndReview.create({
      course: courseId,
      user: userId,
      rating,
      review,
    });

    //update the course with the new rating and review
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { ratingAndReviews: newRating._id },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);
    //return response
    return res.status(201).json({
      success: true,
      message: "Rating and review added successfully",
      data: newRating,
    });
  } catch (error) {
    console.error("Error creating rating and review:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//getAverageRating handler
exports.getAverageRating = async (req, res) => {
  try {
    // get course id
    const courseId = req.body.courseId;

    //calculate avg rating

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    //return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Average rating fetched successfully",
        data: {
          averageRating: result[0].averageRating,
        },
      });
    }
    //if no ratings found
    return res.status(404).json({
      success: false,
      message: "No ratings found for this course",
      averageRating: 0,
    });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//getAllRatings handler
exports.getAllRatings = async (req, res) => {
  try {
    //get course id
    const courseId = req.body.courseId;

    //fetch all ratings for the course
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email profilePicture",
      })
        .populate({
            path: "course",
            select: "courseName",
        });

    //return response
    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: allReviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
