import { addToQueue, removeFromQueue, findMatch,
    isUserInActiveRequests } from "./message-queue-controller.js";
import 'ws';

const TIMEOUT = 30000; // 30 seconds timeout for finding a match
const RESPONSE_TIMEOUT = 10000; // 10 seconds timeout for direct match

// Store WebSocket clients (users)
const requestClients = new Map();
const connectedClients = new Map();

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

    // Check if the user already has an active request
    if (await isUserInActiveRequests(userId)) {
        ws.send(JSON.stringify({
            status: 500,
            message: 'You already have a matching request in progress.'
        }));
        return;
    }

    // Store user info on the WebSocket object for easy access later
    ws.user = { userId, topic, difficulty };

    requestClients.set(userId, ws); // Store WebSocket connection for the user in the clients Map
    
    try {
        await addToQueue(request);
        // Try to match users
        const matchFound = await matchUsers(topic, difficulty);

        // If no match found, set a timeout to ask the user to stay or leave
        if (!matchFound) {
            ws.send(JSON.stringify({
                status: 'matching',
                message: `Matching...`,
                user: ws.user
            }));
            setMatchTimeout(ws, topic, difficulty);
        }
    } catch (error) {
        console.error('Error joining queue:', error);
        ws.send(JSON.stringify({
            status: 500,
            message: 'An error occurred while joining the queue.'
        }));
    }
}

// Attempt to match users
async function matchUsers(topic, difficulty) {
    try {
        const match = await findMatch(topic, difficulty);
        if (match) {
            notifyMatch(match); // Notify users of the match
            return true; // Match found
        }
        return false; // No match found
    } catch (error) {
        console.error('Error finding a match:', error);
        return false;
    }
}

// Notify both users of a match
function notifyMatch(match) {
    const { request1, request2, topic, difficulty } = match;
    const user1Ws = requestClients.get(request1.userId); // Retrieve user1's WebSocket from clients Map
    const user2Ws = requestClients.get(request2.userId); // Retrieve user2's WebSocket from clients Map

    if (user1Ws && user2Ws) {
        user1Ws.send(JSON.stringify({
            status: 'success',
            message: `You have been matched with ${request2.userId} on topic ${topic}.`,
            userId: request2.userId,
            topic: topic,
            difficulty: difficulty
        }));

        user2Ws.send(JSON.stringify({
            status: 'success',
            message: `You have been matched with ${request1.userId} on topic ${topic}.`,
            userId: request1.userId,
            topic: topic,
            difficulty: difficulty
        }));

        handleLeaveQueue(user1Ws, request1)
        handleLeaveQueue(user2Ws, request2)
    }
}

// Handle user choosing to stay in the queue
function handleStayInQueue(ws) {
    if (ws.user) {
        // If no match found, set a timeout to ask the user to stay or leave
        ws.send(JSON.stringify({
            status: 'matching',
            message: `Matching...`,
            user: ws.user
        }));
        setMatchTimeout(ws, ws.user.topic, ws.user.difficulty);
    }
}

// Set a timeout for users to choose to stay or leave
async function setMatchTimeout(ws, topic, difficulty) {
    // Clear the match timeout if it exists
    if (ws.matchTimeout) {
        clearTimeout(ws.matchTimeout);
        delete ws.matchTimeout; // Clean up
    }
    
    // Store the timer on the WebSocket object
    ws.matchTimeout = setTimeout(async () => {
        const isInQueue = await isUserInActiveRequests(ws.user.userId);
        if(!isInQueue) {
            console.log(isInQueue);
            clearTimeout(ws.matchTimeout);
            return;
        }
        console.log("Set timer");
        // Notify the user that no match was found within the timeout period
        ws.send(JSON.stringify({
            status: 'timeout',
            message: 'No match found within 30 seconds. Do you want to stay in the queue for another attempt?'
        }));

        const responseTimeout = setTimeout(() => {
            console.log("Response timeout, leaving the queue");
            handleLeaveQueue(ws, { userId: ws.user.userId, topic, difficulty });
        }, RESPONSE_TIMEOUT); // 10 seconds

        // Listen for user response to stay or leave
        ws.on('message', (msg) => {
            const data = JSON.parse(msg);
            if (data.event === 'stayInQueue') {
                console.log("Clear response timeout");
                clearTimeout(ws.matchTimeout); // Clear timer if they choose to stay
                clearTimeout(responseTimeout); // Clear timer if they choose to stay
            } else if (data.event === 'leaveQueue') {
                // Notify the user that no match was found within the timeout period
                console.log("Clear timeout");
                clearTimeout(ws.matchTimeout); // Clear timer if they choose to leave
                clearTimeout(responseTimeout); // Clear timer if they choose to stay
            }
        });
    }, TIMEOUT); // 30 seconds
}

// Handle user leaving the queue
async function handleLeaveQueue(ws, data) {
    const { userId, topic, difficulty } = data;
    const request = { userId, topic, difficulty };

    // Clear the match timeout if it exists
    if (ws.matchTimeout) {
        clearTimeout(ws.matchTimeout);
        delete ws.matchTimeout; // Clean up
    }

    try {
        await removeFromQueue(request);

        // Remove the user from the clients Map
        requestClients.delete(userId);

        // Notify user they have left the queue
        if (ws.user) {
            ws.send(JSON.stringify({
                status: 'leave',
                message: 'You have left the queue.'
            }));
        }
    } catch (error) {
        console.error('Error removing user from the queue:', error);
        ws.send(JSON.stringify({
            status: 500,
            message: 'An error occurred while leaving the queue.'
        }));
    }
}


// Handle user disconnect
export async function handleDisconnect(ws) {
    console.log('Client disconnected');
    if (ws.user) {
        await handleLeaveQueue(ws, { userId: ws.user.userId, topic: ws.user.topic, difficulty: ws.user.difficulty });
    }
    // Ensure that the user is removed from the clients Map on disconnect
    requestClients.delete(ws.user?.userId);
}
