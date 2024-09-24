import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserModelSchema = new Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user-account', // Referencing the User model (user-account is the name in the User model)
    required: true 
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Setting default to the current date/time
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default mongoose.model("user-account", UserModelSchema);
