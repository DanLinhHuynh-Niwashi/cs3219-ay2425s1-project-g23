import "dotenv/config";
import History from './history-model.js'; // Mongoose Category model
import axios from 'axios';

import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;
  console.log("mongoDBUri:", mongoDBUri)
  await connect(mongoDBUri);
}

export async function fetchQuestionById(questionId) {
  try {
    const response = await axios.get(`http://question-service:3001/questions/${questionId}`);
    return response.data.data; // assuming the data is in the `data` field of the response
  } catch (error) {
    console.error(`Failed to fetch question with ID ${questionId}:`, error);
    throw new Error('Could not retrieve question details');
  }
}

export async function fetchCategoryById(categoryId) {
  try {
    const response = await axios.get(`http://question-service:3001/categories/${categoryId}`);
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
