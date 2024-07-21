import cloudinary from "../server.js";
import fs from "fs";
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath.path, {
      resource_type: "auto",
    });

    console.log("File is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath.path);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath.path); // remove locally saved temp files as the upload operation fails
    return null;
  }
};

export { uploadOnCloudinary };
