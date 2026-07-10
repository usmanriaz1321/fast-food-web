// serv../controllers/web/uploadController.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 0,
                message: 'No file uploaded'
            });
        }

        // ✅ Upload to Cloudinary (stored forever)
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'friends-family', // Organize images in folders
            use_filename: true
        });

        // ✅ Delete temporary file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            status: 1,
            message: 'Image uploaded successfully!',
            data: {
                url: result.secure_url,  // ✅ This URL is permanent
                public_id: result.public_id
            }
        });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            status: 0,
            message: 'Upload failed. Please try again.'
        });
    }
};

module.exports = { uploadImage };