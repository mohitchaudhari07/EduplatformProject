const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { courseId, sectionName } = req.body;
    //datavalidation
    if (!courseId || !sectionName) {
      return res
        .status(400)
        .json({ message: "Course ID and section name are required" });
    }
    //create section
    const newSection = new Section.create({
      sectionName,
    });
    //update course with section id
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      { $push: { courseContent: newSection._id } },
      { new: true }
    );
    //use populate to replace section/subsection both in updatedCourseDetails and newSection

    const populatedCourse = await Course.findById(
      updatedCourseDetails._id
    ).populate("courseContent");
    const populatedSection = await Section.findById(newSection._id).populate(
      "subSections"
    );

    //return response
    return res.status(201).json({
      message: "Section created successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error , unable to create section" });
  }
};

exports.updateSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, sectionId } = req.body;
    //data validation
    if (!sectionName || !sectionId) {
      return res
        .status(400)
        .json({ message: "Section ID and section name are required" });
    }
    //update data
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    //return response
    return res.status(200).json({
      message: "Section updated successfully",
      success: true,
      updatedSection,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error , unable to update section" });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    //data fetch
    const { sectionId } = req.params;
    //data validation
    if (!sectionId) {
      return res.status(400).json({ message: "Section ID is required" });
    }
    //delete section
    const deletedSection = await Section.findByIdAndDelete(sectionId);
    //delete entry from the schema

    //return response
    return res.status(200).json({
      message: "Section deleted successfully",
      success: true,
      deletedSection,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error , unable to delete section" });
  }
};
