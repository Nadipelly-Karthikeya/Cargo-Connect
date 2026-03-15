const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET &&
         process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
         process.env.CLOUDINARY_API_KEY !== 'your_api_key';
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary configured');
} else {
  console.warn('⚠️  Cloudinary not configured - using placeholder URLs for development');
}

const uploadToCloudinary = async (filePath, folder) => {
  try {
    // If Cloudinary is not configured, return a placeholder URL for development
    if (!isCloudinaryConfigured()) {
      console.log(`📁 Skipping upload for ${filePath} (Cloudinary not configured)`);
      // Delete local file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return `http://placeholder.dev/document/${folder}/${Date.now()}`;
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `cargo-connect/${folder}`,
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error) {
    // In development, don't fail - use placeholder
    if (process.env.NODE_ENV === 'development') {
      console.warn(`⚠️  Upload failed, using placeholder: ${error.message}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return `http://placeholder.dev/document/${folder}/${Date.now()}`;
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!isCloudinaryConfigured()) {
      console.log('📁 Skipping delete (Cloudinary not configured)');
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured };
