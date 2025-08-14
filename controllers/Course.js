const Course = require("../models/Course");
const Tag = require("../models/Category");
const User = require("../models/User");

require("dotenv").config();

const { uploadImage } = require("../utils/imageUploader");

//create course handler
exports.createCourse = async (req, res) => {
  try {
    //get data from request body
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    //getThumbnail from request
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    //check if instructor exists

    const instructor = await User.findById(req.user._id);
    console.log(instructor);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    //check if tag exists
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({ message: "Tag not found" });
    }

    //upload thumbnail to cloudinary
    const thumbnailDetails = await uploadImage(
      thumbnail,
      process.env.FOLDER_NAME,
      300,
      60
    );

    //create an entry in the database
    const courseDetails = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailDetails.secure_url,
      instructor: instructor._id,
    });

    //add the new course to the user schema of instructor
    await User.findByIdAndUpdate(
      instructor._id,
      {
        $push: {
          courses: courseDetails._id,
        },
      },
      { new: true }
    );

    //update the tag schema to add the new course
    await Tag.findByIdAndUpdate(
      tagDetails._id,
      {
        $push: {
          tag: tagDetails._id,
        },
      },
      { new: true }
    );

    return res
      .status(201)
      .json({ message: "Course created successfully", courseDetails });
  } catch (error) {
    res.status(500).json({ message: "Error creating course", error });
  }
};

//get all courses handler

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        tag: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();
    if (!allCourses) {
      return res.status(404).json({ message: "No courses found" });
    }
    return res.status(200).json(allCourses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error });
  }
};


//get course details

exports.getCourseDetails = async (req, res) => {
  try {
    const {courseId} = req.body;
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("tag")
      .populate("category")
      .populate({path :"courseContent", populate: { path: "subSection" }})
      .populate("ratingAndReviews")
      .exec();

    if (!courseDetails) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(200).json(courseDetails);
  }catch (error) {
    res.status(500).json({ message: "Error fetching course details", error });
  } 
}