const mongoose = require('mongoose');   
require('dotenv').config(); // Load environment variables from .env file

exports.connectDB = async () => {
    try{
        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() =>{
            console.log("MongoDB connected successfully")
        })
    }
    catch(err){
        console.error("MongoDB connection error:", err.message);
        process.exit(1); // Exit process with failure
    }
}