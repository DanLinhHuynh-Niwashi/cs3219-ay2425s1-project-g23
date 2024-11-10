import { addToQueue, removeFromQueue, findMatch, isUserInActiveRequests } from "../model/message-queue.js";
import 'ws';
import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { redisClient, pubClient, subClient } from '../model/redisClient.js'
import { request } from "express";

const TIMEOUT = 30000; // 30 seconds timeout for finding a match
const RESPONSE_TIMEOUT = 10000; // 10 seconds timeout for direct match

const requestClients = new Map();

const registerClient = async (userId, ws) => {
    // Mark user as connected in Redis
    console.log(userId);
    await redisClient.set(`user:${userId}:connected`, JSON.stringify(true));

    // Subscribe to the user-specific Redis channel
    await subClient.subscribe(`user:${userId}:messages`, (message) => {
        if (requestClients.has(userId)) {
            const client = requestClients.get(userId);
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
                console.log(`Message sent to user ${userId}: ${message}`);
            }
        }
    });

    await subClient.subscribe(`user:${userId}:matchfound`, (message) => {
        const data = JSON.parse(message);
        if (!data) return;
        const { userId } = data;
        if (requestClients.has(userId)) {
            const request = requestClients.get(userId).request;
            if (request) {
                handleLeaveQueue(ws, request);
            }
        }
    });
    ws.on('close', () => handleDisconnect(userId, ws));
};

const sendMessageToUser = async (userId, message) => {
    // if (requestClients.has(userId)) {
    //     const client = requestClients.get(userId);
    //     if (client.ws.readyState === WebSocket.OPEN) {
    //         client.ws.send(message);
    //         console.log(`Message sent to user ${userId}: ${message}`);
    //     }
    // } else {
        await pubClient.publish(`user:${userId}:messages`, message);
    // }   
};

const handleMatchFound = async (userId) => {
    // if (requestClients.has(userId)) {
    //     const client = requestClients.get(userId);
    //     if (client.ws && client.request) {
    //         handleLeaveQueue(client.ws, client.request);
    //     }
    // } else {
        await pubClient.publish(`user:${userId}:matchfound`, JSON.stringify({userId}));
    // }   
};

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

    requestClients.set(userId, { ws, matchTimeoutId: null, request });
    registerClient(userId, ws);

    try {
        await addToQueue(request);
        const matchFound = await matchUsers(topic, difficulty);

        if (!matchFound) {
            ws.send(JSON.stringify({
                status: 'matching',
                message: `Matching...`,
                clientId: userId
            }));
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

// Attempt to match users
async function matchUsers(topic, difficulty) {
    try {
        const match = await findMatch(topic, difficulty);
        if (match) {
            notifyMatch(match); // Notify users of the match
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error finding a match:', error);
        return false;
    }
}

// Notify both users of a match
function notifyMatch(match) {
    const { request1, request2, topic, difficulty } = match;
    const sessionId = uuidv4();

    [request1, request2].forEach(request => {
        sendMessageToUser(request.userId, JSON.stringify({
            status: 'success',
            message: `You have been matched with another user on topic ${topic}.`,
            userId: request.userId === request1.userId ? request2.userId : request1.userId,
            clientId: request.userId,
            topic,
            difficulty,
            sessionId
        }));
    });


    handleMatchFound(request1.userId);
    handleMatchFound(request2.userId);
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
        }, RESPONSE_TIMEOUT);

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
    }, TIMEOUT);

    return matchTimeout;
}

// Handle user leaving the queue
async function handleLeaveQueue(ws, data) {
    const { userId, topic, difficulty } = data;
    const request = { userId, topic, difficulty };

    try {
        await removeFromQueue(request);
        if (requestClients.get(userId)?.matchTimeoutId) {
            clearTimeout(requestClients.get(userId).matchTimeoutId);
            requestClients.get(userId).matchTimeoutId = null;
        }

        await subClient.unsubscribe(`user:${userId}:messages`).catch((err) => 
            console.error(`Failed to unsubscribe user from messages: ${err}`));

        await subClient.unsubscribe(`user:${userId}:matchfound`).catch((err) => 
            console.error(`Failed to unsubscribe user from messages: ${err}`));
        requestClients.delete(userId);

        ws.send(JSON.stringify({
            status: 'leave',
            clientId: userId,
            message: 'You have left the queue.'
        }));

    } catch (error) {
        console.error('Error removing user from the queue:', error);
    }
}

// Handle user disconnection and cleanup
export function handleDisconnect(userId) {
    // Find the user associated with this WebSocket connection
    const clientData = requestClients.get(userId);
    if (clientData) {
        console.log(`Client disconnected: ${userId}`);

        handleLeaveQueue(clientData.ws, clientData.request);

        redisClient.del(`user:${userId}:connected`).catch((err) => console.error(`Failed to remove user connection status: ${err}`));
        return;
    }

    console.error('WebSocket disconnect for an unregistered client.');
}
