import "dotenv/config";
import History from './history-model.js'; // Mongoose Category model
import axios from 'axios';

import { connect } from "mongoose";
import mongoose from "mongoose";

const questionPort = process.env.QUESTION_PORT || 3001
let retryCount = 0;
const reconnectMaxRetries = 5; // Max retries for reconnection after disconnection
const retryInterval = 5000; // Retry every 5 seconds

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


export async function fetchQuestionById(questionId) {
  try {
    const response = await axios.get(`http://question-service:${questionPort}/questions/${questionId}`);
    return response.data.data; // assuming the data is in the `data` field of the response
  } catch (error) {
    console.error(`Failed to fetch question with ID ${questionId}:`, error);
    throw new Error('Could not retrieve question details');
  }
}

export async function fetchCategoryById(categoryId) {
  try {
    const response = await axios.get(`http://question-service:${questionPort}/categories/${categoryId}`);
    return response.data.data; // assuming the data is in the `data` field of the response
  } catch (error) {
    console.error(`Failed to fetch category with ID ${categoryId}:`, error);
    throw new Error('Could not retrieve category details');
  }
}

// Find a question by its ID
export async function findAttemptById(id) {
  try {
    const attempt = await History.findById(id);
    return attempt;
  } catch (error) {
    console.error('Error finding attempt by ID:', error);
    throw error;
  }
}

export async function findAllAttempts(userId) {
  try {
    // Find attempts only for the specified user
    const attempts = await History.find({ userId: userId });
    return attempts;
  } catch (error) {
    console.error('Error finding user attempts:', error);
    throw error;
  }
}
