const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");
const path = require("path");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

function uploadMiddleware(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const folderPath = `${folderName.trim()}`;
      const fileExtension = path.extname(file.originalname).substring(1);
      const publicId = `${file.fieldname}-${Date.now()}`;
      return {
        folder: folderPath,
        public_id: publicId,
        format: fileExtension,
        transformation: [
          {
            width: 200,
            height: 200,
            crop: "scale",
          },
          { radius: 20 },
          { angle: 10 },
        ],
      };
    },
  });
  return multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });
}

module.exports = uploadMiddleware;
