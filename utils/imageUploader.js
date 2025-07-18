const cloudinary = require('cloudinary').v2;

exports.uploadImage = async (file , folder , height , quality) => {
    const options ={folder};
        
       if(height) {
            options.height= height;
        }
        if(quality) {
            options.quality= quality;
        }

        options.resource_type = 'auto'; // Automatically detect the resource type (image, video, etc.)
        
        return await cloudinary.uploader.upload(file.tempFilePath, options);
    
}
