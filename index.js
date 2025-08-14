const express = require('express');
const mongoose = require('mongoose');
const app = express();

const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/categoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const courseRoutes = require('./routes/courseRoutes');

const database = require('./config/database');
const cloudinary = require('./config/cloudinary');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {cloudinaryConnect} = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.Port || 4000;


database.connect();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));

//cloudinary connection
cloudinaryConnect();

//routes
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/course', courseRoutes);


//default route
app.get('/', (req, res) => {
    res.send('Welcome to StudyNotion API');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
