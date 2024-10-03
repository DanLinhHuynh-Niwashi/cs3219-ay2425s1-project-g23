import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserProfileSchema = new Schema({
  _id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user-account', // Referring to the user-account model (User)
    required: true 
  },
  name: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum:["Male", "Female", "Others"],
    required: false,
  },
  location: {
    type: String,
    default: "",
  },
  proficiency: {
    type: String,
    default: "Beginner",
  },
  github: {
    type: String,
    unique: true,
    sparse: true,
  },
  linkedin: {
    type: String,
    unique: true,
    sparse: true,
  },
});

export default mongoose.model("user-profile", UserProfileSchema);
