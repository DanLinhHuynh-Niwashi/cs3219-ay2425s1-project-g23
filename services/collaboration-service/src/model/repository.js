import SessionSummaryModel from "./session-summary.js";
import "dotenv/config";
import { connect } from "mongoose";
import mongoose from "mongoose";
export async function connectToDB() {
    try {
      let mongoDBUri =
      process.env.ENV === "PROD"
        ? process.env.DB_CLOUD_URI
        : process.env.DB_LOCAL_URI;
      console.log("mongoDBUri:", mongoDBUri)
      await connect(mongoDBUri);
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error; // Will be caught by startServer() in the main code
    }
  };
  
  export const handleDBEvents = () => {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
      retryCount=0;
    });
  
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      // If disconnected, try to reconnect
      reconnectToDB();
    });
  
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      // If disconnected, try to reconnect
      reconnectToDB();
    });
  };
  
  const reconnectToDB = () => {
    console.log("Attempting to reconnect to MongoDB...");
    
    setTimeout(() => {
      if (retryCount==reconnectMaxRetries) {
        process.exit(1);
      }
      retryCount++;
      connectToDB().catch((err) => {
        console.error("MongoDB reconnection failed:", err);
        reconnectToDB(); // Retry reconnection
      });
    }, retryInterval); // Retry every 5 seconds
  };

export async function getSessionSummary(sessionId) {
    return await SessionSummaryModel.findOne({ sessionId }).lean();
}