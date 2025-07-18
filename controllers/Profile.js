const Profile = require("../models/Profile");
const User = require("../models/User");

exports.uptdateProfile = async (req, res) => {
  try {
    //get data
    const { gender, dateOfBirth = "", about = "", contactNumber } = req.body;
    //get user id from token
    const id = req.user.id;

    //validation
    if (!gender || !contactNumber || !id) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    //find user
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    if (!profileDetails) {
      return res.status(404).json({ message: "Profile not found" });
    }
    //update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    profileDetails.gender = gender;
    await profileDetails.save();
    //return response
    res
      .status(200)
      .json({ message: "Profile updated successfully", success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error , profile not updated" });
  }
};

//delete profile
exports.deleteProfile = async (req, res) => {
  try {
    //get user id from token
    const id = req.user.id;
    //find user
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }
    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
    //unenroll user from all courses
    await User.updateMany({ _id: id }, { $set: { studentsEnrolled: [] } });
    //delete user
    await User.findByIdAndDelete({ _id: id });

    //return response
    res
      .status(200)
      .json({ message: "Profile deleted successfully", success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error , profile not deleted" });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    //get user id from token
    const id = req.user.id;
    //find user
    const userDetails = await User.findById(id).populate("additionalDetails").exec();
    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    //return response
    res
      .status(200)
      .json({
        message: "Profile fetched successfully",
        success: true,
        profileDetails: userDetails.additionalDetails,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error , profile not fetched" });
  }
};
