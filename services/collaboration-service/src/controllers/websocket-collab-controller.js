import SessionSummaryModel from '../model/session-summary.js';
import { getSessionSummary } from '../model/repository.js';
import { format } from 'date-fns';
import axios from 'axios';

export async function handleEndSession(userId, sessionId, sessions, clients, questionId, finalCode) {
    const existingSession = await getSessionSummary(sessionId);
    if (existingSession) {
        return;
    }
    const session = sessions.get(sessionId);
    const participantsArray = Array.from(session.participants);
    // Map the participants to the required structure
    const participants = participantsArray.map(participantId => ({ userId: participantId }));
    const leavingUserId = userId;
    const partnerUserId = participantsArray.find(id => id !== leavingUserId);

    // Collect data to save as session summary
    const joinTime = sessions.get(sessionId).joinTimes.get(leavingUserId);
    const leaveTime = new Date();
    const duration = ((leaveTime - joinTime) / 1000 / 60).toFixed(2); // Duration in minutes
    const now = new Date();
    const dateTime = format(now, 'dd-MM-yyyy HH:mm');

    // Collect data to save as session summary
    const sessionData = {
        sessionId: sessionId,
        participants: participants, // Include both users
        // Add any other relevant data like messages or duration if available
        messages: [], // Placeholder for messages if you have them
        duration: duration, // Assuming you have a function to calculate duration
        dateTime: joinTime,
        questionId: questionId,
        attemptedCode: finalCode,
    };
    // Save session summary data to the database
    saveSessionSummary(sessionData);

    // Create history entries for each participant
    try {
        console.log("leavingUserId", leavingUserId);
        console.log("joinTime:", joinTime);
        console.log("duration:", duration);
        console.log("finalCode:", finalCode);
        const historyEntryDataUser1 = {
            userId:leavingUserId,
            questionId,
            attemptedDate: joinTime,
            attemptDuration: duration,
            attemptedCode: finalCode,
        };

        const historyEntryDataUser2 = {
            userId: partnerUserId,
            questionId,
            attemptedDate: joinTime,
            attemptDuration: duration,
            attemptedCode: finalCode,
        };

        try {
            const response_user1 = await axios.post(`http://history-service:8082/history`, historyEntryDataUser1);
            console.log("History entry created successfully for user 1:", response_user1.data);
        } catch (error) {
            console.error("Error creating history entry for user 1:", error.message);
        }

        try {
            const response_user2 = await axios.post(`http://history-service:8082/history`, historyEntryDataUser2);
            console.log("History entry created successfully for user 2:", response_user2.data);
        } catch (error) {
            console.error("Error creating history entry for user 2:", error.message);
        }
    } catch (error) {
        console.error("General error in creating history entries:", error.message);
    }

    // Notify the partner user if they exist
    if (partnerUserId) {
        const partnerWs = clients[partnerUserId]; // Assuming clients is accessible here
        if (partnerWs && partnerWs.readyState === 1) {
            partnerWs.send(JSON.stringify({
                type: 'partnerLeft',
                clientId: partnerUserId,
                message: `${leavingUserId} has left the session. You will be redirected in 10 seconds if no new partner connects.`
            }));

            console.log("first log:", partnerWs.readyState);
            // Set a 10-second delay before closing the partner's connection
            setTimeout(() => {
                console.log("second log:", partnerWs.readyState);
                if (partnerWs.readyState === 1) {
                    partnerWs.send(JSON.stringify({
                        type: 'sessionEnded',
                        clientId: partnerUserId,
                        message: 'Session has ended. You will be redirected to the summary page.'
                    }));
                    console.log("Partner WebSocket closed by server after timeout.");
                }
            }, 10000); // 10-second delay
        }
    }

    // Clean up sessions data
    sessions.delete(sessionId); // Remove the session from the active sessions
}

// Controller to fetch session summary
export async function fetchSessionSummary(req, res) {
    const { sessionId } = req.params;
    try {
        const sessionData = await getSessionSummary(sessionId);

        if (!sessionData) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(sessionData);
    } catch (error) {
        console.error('Error fetching session summary:', error);
        res.status(500).json({ message: 'Failed to fetch session summary' });
    }
}

// Function to save session summary to the database
export async function saveSessionSummary(sessionData) {
    try {
        await SessionSummaryModel.findOneAndUpdate(
            { sessionId: sessionData.sessionId },
            sessionData,
            { upsert: true } // Inserts if the document doesn't exist
        );
        console.log("Session summary saved successfully:", sessionData);
    } catch (error) {
        console.error("Error saving session summary:", error);
    }
}

