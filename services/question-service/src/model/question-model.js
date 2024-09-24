import mongoose from "mongoose";

// Define the Question schema
const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  complexity: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
  },
  categories: [
    {
      type: Number,
      required: true,
    },
  ],
});

export default mongoose.model('Question', questionSchema, 'questions');
