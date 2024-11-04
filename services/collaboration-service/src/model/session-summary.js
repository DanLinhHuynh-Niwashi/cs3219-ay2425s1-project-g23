import mongoose from "mongoose";

// Define the session schema
const sessionSummarySchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  participants: [
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user-account", // Reference to the UserProfile model
            required: true
        },
    },
  ],
  messages: [
    {
      senderId: { type: String, },
      message: { type: String,  },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  duration: { type: String },
  summaryNotes: { type: String },
});

// Export the model directly
export default mongoose.model('SessionSummary', sessionSummarySchema, 'session_summaries');