const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
   
    title:{
        type: String,
        required: true,
        trim: true,
    },
    timeDuration:{
        type: String,
        trim: true,

    },
    description:{
        type: String,
    },
    videoURL:{
        type: String,
        required: true,
    },

});

module.exports = mongoose.model("SubSection", subSectionSchema);
