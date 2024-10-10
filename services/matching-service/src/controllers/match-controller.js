import { addUserToQueue, removeUserFromQueue, findMatch } from '../mock-queue.js';

const TIMEOUT_DURATION = 10000; // 30 seconds
const CHECK_INTERVAL = 200; // Check every 200 miliseconds

const createTimeoutPromise = () => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error("Request timed out: No match found after 10 seconds"));
        }, TIMEOUT_DURATION);
    });
};

const checkForMatch = (userId, topic, difficulty, intervalId) => {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const match = findMatch({ userId, topic, difficulty });

            if (match) {
                clearInterval(interval); // Stop checking for matches
                resolve(match);
            }
        }, CHECK_INTERVAL);
    });
};

export const requestMatch = async (req, res) => {
    const { userId, topic, difficulty } = req.body;

    // Add user to the queue
    addUserToQueue({ userId, topic, difficulty });

    try {
        const timeoutPromise = createTimeoutPromise();
        const matchPromise = checkForMatch(userId, topic, difficulty);

        // Wait for either a match or timeout
        const match = await Promise.race([matchPromise, timeoutPromise]);

        // If match, send the response
        return res.status(200).json({ message: "Match found!", match });
    } catch (error) {
        // Handle timeout or other errors
        return res.status(500).json({ error: error.message });
    }
};

export const cancelMatch = (req, res) => {
    const { userId } = req.params;

    removeUserFromQueue(userId);

    return res.status(200).json({ message: `Match request cancelled for user: ${userId}` });
};