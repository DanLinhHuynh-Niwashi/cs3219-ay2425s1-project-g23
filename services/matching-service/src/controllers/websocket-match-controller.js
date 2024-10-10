import { addToQueue, removeFromQueue, findMatch } from "../model/mock-queue.js";
import 'ws';

const TIMEOUT = 30000; // 30 seconds timeout for finding a match

// Store WebSocket clients (users)
const clients = new Map();

export function handleMessage(ws, message) {
    const data = JSON.parse(message);
    switch (data.event) {
        case 'joinQueue':
            handleJoinQueue(ws, data);
            break;
        case 'stayInQueue':
            handleStayInQueue(ws);
            break;
        case 'leaveQueue':
            handleLeaveQueue(ws, data);
            break;
        default:
            console.log(`Unknown event type: ${data.event}`);
    }
}

// Handle user joining the queue
async function handleJoinQueue(ws, data) {
    const { userId, topic, difficulty } = data;
    const request = { userId, ws, topic, difficulty };

    // Check if the user already has a matching request in progress
    if (clients.has(userId) && clients.get(userId).user.isMatching) {
        ws.send(JSON.stringify({
            status: 500,
            message: 'You already have a matching request in progress.'
        }));
        return;
    }

    // Store user info on the WebSocket object for easy access later
    ws.user = { userId, topic, difficulty, isMatching: true };

    clients.set(userId, ws); // Store WebSocket connection for the user in the clients Map
    
    // Add user to the queue
    addToQueue(request);

    // Try to match users immediately
    const matchFound = await matchUsers(topic, difficulty);

    // If no match is found, set a timeout to ask the user to stay or leave
    if (!matchFound) {
        ws.send(JSON.stringify({
            status: 100,
            message: `Matching...`,
            user: ws.user
        }));
        await setMatchTimeout(ws, topic, difficulty);
    }
}

// Attempt to match users
async function matchUsers(topic, difficulty) {
    const match = findMatch(topic, difficulty);
    if (match) {
        notifyMatch(match); // Notify users of the match
        return true; // Match found
    }
    return false; // No match found
}

// Notify both users of a match
function notifyMatch(match) {
    const { request1, request2, topic, difficulty } = match; // Assume match contains user1 and user2 info

    const user1Ws = clients.get(request1.userId); // Retrieve user1's WebSocket from clients Map
    const user2Ws = clients.get(request2.userId); // Retrieve user2's WebSocket from clients Map

    if (user1Ws && user2Ws) {
        user1Ws.send(JSON.stringify({
            status: 200,
            message: `You have been matched with ${request2.userId} on topic ${topic}.`,
            userId: request2.userId,
            topic: topic,
            difficulty: difficulty
        }));
        
        user2Ws.send(JSON.stringify({
            status: 200,
            message: `You have been matched with ${request1.userId} on topic ${topic}.`,
            userId: request1.userId,
            topic: topic,
            difficulty: difficulty
        }));
    }
}

// Handle user choosing to stay in the queue
function handleStayInQueue(ws) {
    if (ws.user) {
        ws.send(JSON.stringify({
            status: 200,
            message: 'You chose to stay in the queue for another matching attempt.'
        }));

        // Try to match users again
        matchUsers(ws.user.topic, ws.user.difficulty);
    }
}

// Set a timeout for users to choose to stay or leave
async function setMatchTimeout(ws, topic, difficulty) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            // Notify the user that no match was found within the timeout period
            ws.send(JSON.stringify({
                status: 500,
                message: 'No match found within 30 seconds. Do you want to stay in the queue for another attempt?'
            }));

            // Listen for user response to stay or leave
            ws.on('message', (msg) => {
                const data = JSON.parse(msg);
                if (data.event === 'stayInQueue') {
                    clearTimeout(timer); // Clear timer if they choose to stay
                    handleStayInQueue(ws); // Attempt to find a match again
                    resolve();
                } else if (data.event === 'leaveQueue') {
                    clearTimeout(timer); // Clear timer if they choose to leave
                    handleLeaveQueue(ws, { userId: ws.user.userId, topic, difficulty });
                    resolve();
                }
            });
        }, TIMEOUT); // 30 seconds
    });
}

// Handle user leaving the queue
function handleLeaveQueue(ws, data) {
    const { userId, topic, difficulty } = data;
    const request = { userId, topic, difficulty };

    removeFromQueue(request);

    // Remove the user from the clients Map
    clients.delete(userId);

    // Notify user they have left the queue
    if (ws.user) {
        ws.send(JSON.stringify({
            status: 200,
            message: 'You have left the queue.'
        }));
    }
}

// Handle user disconnect
export function handleDisconnect(ws) {
    console.log('Client disconnected');
    if (ws.user) {
        handleLeaveQueue(ws, { userId: ws.user.userId, topic: ws.user.topic, difficulty: ws.user.difficulty });
    }
    // Ensure that the user is removed from the clients Map on disconnect
    clients.delete(ws.user?.userId);
}
