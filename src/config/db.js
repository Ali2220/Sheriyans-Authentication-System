import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  await mongoose
    .connect(config.MONGO_URI)
    .then(() => {
      console.log("Connected To DB");
    })
    .catch((err) => {
      console.log(`MongoDB Connection Error: ${err.message}`);
    });
}

export default connectDB