const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImage } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
  try {
    //data fetching from request body
    const { title, timeDuration, description, sectionId } = req.body;
    //extract file/video
    const video = req.files.videoFile; // Assuming you're using multer for file uploads

    //validation
    if (!title || !timeDuration || !description || !sectionId) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    if (!video) {
      return res.status(400).json({ message: "Please upload a video" });
    }

    //upload file/video to cloudinary
    const uploadDetails = await uploadImage(video, process.env.FOLDER_NAME);

    //create sub section
    const SubSectionDetails = await SubSection.create({
      title,
      timeDuration,
      description,
      video: uploadDetails.secure_url,
      sectionId,
    });

    //update section with sub section id
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: { subSections: SubSectionDetails._id },
      },
      { new: true }
    );

    //log the updated section after adding populate query
    const updatedSectionWithSubSections = await Section.findById(sectionId)
      .populate(
        "subSections",
        "title timeDuration description video createdAt updatedAt"
      )
      .exec();

    //return response
    return res.status(201).json({
      message: "Sub section created successfully",
      data: SubSectionDetails,
      updatedSection,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Update sub section
exports.updateSubSection = async (req, res) => {
  try {
    const { title, timeDuration, description } = req.body;
    const subSectionId = req.body; // Assuming you're passing the subSectionId in the URL

    //validation
    if (!title || !timeDuration || !description || !subSectionId) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }
    //update sub section
    const updatedSubSection = await SubSection.findByIdAndUpdate(
      subSectionId,
      { title, timeDuration, description },
      { new: true }
    );
    //return response
    return res.status(200).json({
      message: "Sub section updated successfully",
      success: true,
      updatedSubSection,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete sub section
exports.deleteSubSection = async (req, res) => {
  try {
    const subSectionId = req.body; // Assuming you're passing the subSectionId in the URL

    //validation
    if (!subSectionId) {
      return res.status(400).json({ message: "Sub section ID is required" });
    }
    //delete sub section
    const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);
    //return response
    return res.status(200).json({
      message: "Sub section deleted successfully",
      success: true,
      deletedSubSection,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
