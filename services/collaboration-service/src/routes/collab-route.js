import express from 'express';
import WebSocket from 'ws'; 
import { fetchSessionSummary } from '../controllers/websocket-collab-controller.js';
import SessionSummaryModel from '../model/session-summary.js'; // Adjust the path as necessary
let sessions = {}; // {SessionID : {UserID1 : WebSocket1, UserID2 : WebSocket2}}

const collabRoutes = express.Router();

// Define the route for saving session summary
collabRoutes.post('/session-summary', async (req, res) => {
    try {
        const sessionData = req.body;
        console.log("Session data received:", sessionData);

        // Attempt to save the data to the database
        const result = await SessionSummaryModel.findOneAndUpdate(
            { sessionId: sessionData.sessionId },
            sessionData,
            { upsert: true }
        );

        console.log("Database save result:", result);
        res.status(200).json({ message: 'Session summary saved successfully' });
    } catch (error) {
        console.error('Error saving session summary:', error); // This should log detailed error info
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

// Define the route for fetching session summary
collabRoutes.get('/session-summary/:sessionId', fetchSessionSummary);

export default collabRoutes;