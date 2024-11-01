import { addToQueue, removeFromQueue, findMatch,
    isUserInActiveRequests } from "../model/message-queue.js";
import 'ws';

const TIMEOUT = 30000; // 30 seconds timeout for finding a match
const RESPONSE_TIMEOUT = 10000; // 10 seconds timeout for direct match

const requestClients = new Map();

export function handleMessage(ws, message) {
    const data = JSON.parse(message);
    switch (data.event) {
        case 'joinQueue':
            handleJoinQueue(ws, data);
            break;
        case 'stayInQueue':
            handleStayInQueue(ws, data);
            break;
        case 'leaveQueue':
            handleLeaveQueue(ws, data);
            break;
        default:
            console.log(`Ping: ${data.event}`);
    }
}

// Handle user joining the queue
async function handleJoinQueue(ws, data) {
    const { userId, topic, difficulty } = data;
    const request = { userId, topic, difficulty };

    // Check if the user already has an active request
    if (await isUserInActiveRequests(userId)) {
        ws.send(JSON.stringify({
            status: 500,
            clientId: userId,
            message: 'You already have a matching request in progress.'
        }));
        return;
    }

    if (topic == null || userId == null || difficulty == null) {
        ws.send(JSON.stringify({
            status: 500,
            clientId: null,
            message: 'Invalid data.'
        }));
        return;
    }

    // Store the WebSocket and initialize the timeout ID
    requestClients.set(userId, { ws, matchTimeoutId: null, request: request });

    try {
        await addToQueue(request);
        // Try to match users
        const matchFound = await matchUsers(topic, difficulty);

        // If no match found, set a timeout to ask the user to stay or leave
        if (!matchFound) {
            ws.send(JSON.stringify({
                status: 'matching',
                message: `Matching...`,
                clientId: userId
            }));
            // Set the match timeout and store the timeout ID in the map
            const matchTimeoutId = await setMatchTimeout(ws, userId, topic, difficulty);
            requestClients.get(userId).matchTimeoutId = matchTimeoutId;
        }
    } catch (error) {
        console.error('Error joining queue:', error);
        ws.send(JSON.stringify({
            status: 500,
            clientId: userId,
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
    const user1Ws = requestClients.get(request1.userId).ws; // Retrieve user1's WebSocket from clients Map
    const user2Ws = requestClients.get(request2.userId).ws; // Retrieve user2's WebSocket from clients Map

    if (user1Ws && user2Ws) {
        user1Ws.send(JSON.stringify({
            status: 'success',
            message: `You have been matched with ${request2.userId} on topic ${topic}.`,
            userId: request2.userId,
            clientId:request1.userId,
            topic: topic,
            difficulty: difficulty
        }));

        user2Ws.send(JSON.stringify({
            status: 'success',
            message: `You have been matched with ${request1.userId} on topic ${topic}.`,
            userId: request1.userId,
            clientId:request2.userId,
            topic: topic,
            difficulty: difficulty
        }));

        handleLeaveQueue(user1Ws, request1)
        handleLeaveQueue(user2Ws, request2)
    }
}

// Handle user choosing to stay in the queue
async function handleStayInQueue(ws, data) {
    ws.send(JSON.stringify({
            status: 'matching',
            message: `Matching...`,
            clientId: data.userId
    }));
    // Set the match timeout and store the timeout ID in the map
    try {
        clearTimeout(requestClients.get(data.userId).matchTimeoutId)
        requestClients.get(data.userId).matchTimeoutId=null
    } catch (error) {
        console.log(error)
    }
    const matchTimeoutId = await setMatchTimeout(ws, data.userId, data.topic, data.difficulty);
    requestClients.get(data.userId).matchTimeoutId = matchTimeoutId;
}

// Set a timeout for users to choose to stay or leave
async function setMatchTimeout(ws, userId, topic, difficulty) {
    const matchTimeout = setTimeout(async () => {
        const isInQueue = await isUserInActiveRequests(userId);
        if (!isInQueue) {
            clearTimeout(matchTimeout);
            return;
        }
        console.log("Request timeout");
        ws.send(JSON.stringify({
            status: 'timeout',
            clientId: userId,
            message: 'No match found within 30 seconds. Do you want to stay in the queue for another attempt?'
        }));

        const responseTimeout = setTimeout(() => {
            console.log("Response timeout, leaving the queue");
            handleLeaveQueue(ws, { userId, topic, difficulty });
        }, RESPONSE_TIMEOUT); // 10 seconds

        ws.on('message', (msg) => {
            const data = JSON.parse(msg);
            if (data.event === 'stayInQueue') {
                clearTimeout(matchTimeout);
                clearTimeout(responseTimeout);
            } else if (data.event === 'leaveQueue') {
                clearTimeout(matchTimeout);
                clearTimeout(responseTimeout);
            }
        });
    }, TIMEOUT); // 30 seconds
    return matchTimeout; // Return the timeout ID
}


// Handle user leaving the queue
async function handleLeaveQueue(ws, data) {
    const { userId, topic, difficulty } = data;
    const request = { userId, topic, difficulty };

    try {
        await removeFromQueue(request);

        if (requestClients.get(userId).matchTimeoutId) {
            clearTimeout(requestClients.get(userId).matchTimeoutId)
            requestClients.get(userId).matchTimeoutId=null;
        }
        
        requestClients.delete(userId);
        
        ws.send(JSON.stringify({
            status: 'leave',
            clientId: userId,
            message: 'You have left the queue.'
        }));

    } catch (error) {
        console.error('Error removing user from the queue:', error);
        ws.send(JSON.stringify({
            status: 500,
            clientId: userId,
            message: 'An error occurred while leaving the queue.'
        }));
    }
}

// Add this function to handle disconnections
export function handleDisconnect(ws) {
    for (const [userId, clientData] of requestClients.entries()) {
        if (clientData.ws === ws) {
            if (clientData.request)
            {
                console.log(`Client disconnected: ${userId}`);
                handleLeaveQueue(ws, clientData.request);
            }
            
        }
    }
}
