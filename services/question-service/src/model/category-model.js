import mongoose from "mongoose";

// Define the Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model('Category', categorySchema,'categories');
