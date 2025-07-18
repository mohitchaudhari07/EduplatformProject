const mongoose = require("mongoose");

const courseProgessSchema = new mongoose.Schema({
   courseID:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course",
   },
   completedVideo :[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subSection",
        },
   ],
    
});

module.exports = mongoose.model("courseProgressSchema", courseProgressSchema);
