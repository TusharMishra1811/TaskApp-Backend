import connectDB from "./db/db.js";
import { app } from "./app.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error:", error);
    });
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running at PORT:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDb connection Failed !!`, error);
  });

export default cloudinary;
