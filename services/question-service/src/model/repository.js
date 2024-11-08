import "dotenv/config";
import Category from './category-model.js'; // Mongoose Category model
import Question from './question-model.js'; // Mongoose Question model

import { connect } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;
  console.log("mongoDBUri:", mongoDBUri)
  await connect(mongoDBUri);
}

// Get all categories
export async function findAllCategories() {
    try {
      const categories = await Category.find();
      return categories;
    } catch (error) {
      console.error('Error finding all categories:', error);
      throw error;
    }
  }
// Find a category by its ID
export async function findCategoryById(id) {
    try {
      const category = await Category.findById(id);
      return category;
    } catch (error) {
      console.error('Error finding category by ID:', error);
      throw error;
    }
  }

// Create a new question
export async function createQuestion(title, description, complexity, categories) {
  try {
    const normalizedTitle = title.trim().replace(/\s+/g, ' ');
    const newQuestion = new Question({
      title: normalizedTitle,
      description,
      complexity,
      categories, // categories are an array of IDs
    });
    await newQuestion.save(); // Save to the MongoDB database
    return newQuestion;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
}

// Find a question by its ID
export async function findQuestionById(id) {
  try {
    const question = await Question.findById(id);
    return question;
  } catch (error) {
    console.error('Error finding question by ID:', error);
    throw error;
  }
}

export async function findQuestionsByFilter(categoryName, difficulty) {
  try {
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return [];
    }
    const questions = await Question.find({ categories: category._id, complexity: difficulty });
    return questions
  } catch (error) {
    throw error;
  }
}

// Get all questions
export async function findAllQuestions() {
  try {
    const questions = await Question.find();
    return questions;
  } catch (error) {
    console.error('Error finding all questions:', error);
    throw error;
  }
}

// Update a question by its ID
export async function updateQuestionById(id, title, description, complexity, categories) {
  try {
    const normalizedTitle = title.trim().replace(/\s+/g, ' ');
    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        $set: {
          title: normalizedTitle,
          description,
          complexity,
          categories, 
          // Update the categories array
        }, 
      },
      { new: true } // Return the updated question
    );
    return updatedQuestion;
  } catch (error) {
    console.error('Error updating question by ID:', error);
    throw error;
  }
}

// Delete a question by its ID
export async function deleteQuestionById(id) {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(id); // Delete the question by ObjectId
    if (!deletedQuestion) {
      return null; // If question not found
    }
    return true;
  } catch (error) {
    console.error('Error deleting question by ID:', error);
    throw error;
  }
}

// Check for duplicate question
export async function checkDuplicateQuestion(title, id) {
  try {
    const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, ' ');
    const existingQuestion = await Question.findOne({
      $and: [
        { title: { $regex: new RegExp(`^${normalizedTitle}$`, 'i') } },  // Case-insensitive regex for title
      ]
    });
    if (id) {
      return existingQuestion !== null && existingQuestion.id != id? existingQuestion.id : null;
    }
    return existingQuestion !== null? existingQuestion.id : null;
  } catch (error) {
    console.error('Error checking for duplicate question:', error);
    throw error;
  }
}
