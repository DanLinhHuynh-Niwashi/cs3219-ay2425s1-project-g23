import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    questionId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    duration: {
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
        enum: ['Easy', 'Medium', 'Hard'], // Enforces specific values for complexity
    },
    categories: [{
        type: String, 
        required: true,
    }],
    attemptDateTime: {
        type: Date,
        required: true,
    },
    attemptCode: {
        type: String,
        required: true,
    },
    /*suggestedSolutions: [{
        type: String,
        required: false, // Suggested solutions might not always be available
        validate: {
            validator: function (url) {
                return /^(ftp|http|https):\/\/[^ "]+$/.test(url); // Basic URL validation
            },
            message: 'Suggested solutions must be valid URLs.',
        },
    }],*/
});

export default mongoose.model('History', HistorySchema, 'history-attempts');