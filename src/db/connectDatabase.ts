import mongoose from "mongoose";

const { DATABASE_URI } = process.env;

const connectDatabase = async (): Promise<void> => {
  try {
    if (!DATABASE_URI) {
      throw new Error("DATABASE_URI is not defined in environment variables");
    }

    await mongoose.connect(DATABASE_URI);
    console.log("Successfully connected to database");
  } catch (error) {
    console.error("Error connecting to database");
    console.error(error);
    throw error;
  }
};

export default connectDatabase;