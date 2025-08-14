const Category = require('../models/Category');

//create category handler

exports.createCategory = async (req, res) => {
    try {
        const { name , description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ message: 'All feilds are required' });
        }


        //create entry in db
        const categoryDetails = await Category.create({
            name,
            description
        });
        console.log(categoryDetails)
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
}


//get all categories handler
exports.getAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({},{name:true, description:true});
        if (!allCategories) {
            return res.status(404).json({ message: 'No categories found' });
        }
        res.status(200).json(allCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
}

//category details handler
exports.getCategoryDetails = async (req, res) => {
    try {
        const { id } = req.body;
        const categoryDetails = await Category.findById(id)
                                             .populate("courses").exec();
        if (!categoryDetails) {
            return res.status(404).json({ message: 'Category not found' });
        }
    //get courses for different categories
        const differentCategories = await Category.find({ _id: { $ne: id } })
                                             .populate("courses").exec();

     //get top selling courses
     const topSellingCourses = await Category.aggregate([
            { $unwind: "$courses" },
            { $group: { _id: "$_id", courses: { $push: "$courses" } } },
            { $project: { _id: 0, courses: 1 } }
        ]);

        res.status(200).json({
            categoryDetails,
            differentCategories,
            topSellingCourses
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching category details', error });
    }   

};

