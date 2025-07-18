const Tag = require('../models/Category');

//create tag handler

exports.createTag = async (req, res) => {   
    try {
        const { name , description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ message: 'All feilds are required' });
        }


        //create entry in db
        const tagDetails = await Tag.create({
            name,
            description
        });
        console.log(tagDetails)
    } catch (error) {
        res.status(500).json({ message: 'Error creating tag', error });
    }
}


//get all tags handler
exports.getAllTags = async (req, res) => {
    try {
        const allTags = await Tag.find({},{name:true, description:true});
        if (!allTags) {
            return res.status(404).json({ message: 'No tags found' });
        }
        res.status(200).json(allTags);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tags', error });
    }
}

