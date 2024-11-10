import { WebSocketServer } from 'ws';
import index, { updateDBStatus } from "./index.js";
import "dotenv/config";
import { connectToDB } from "./model/repository.js";
import http from "http";
import { handleEndSession } from './controllers/websocket-collab-controller.js';


const port = process.env.PORT || 8081;
const server = http.createServer(index);

await connectToDB().then(() => {
    console.log("MongoDB Connected!");
    updateDBStatus(true);
    server.listen(port);
    console.log("Collab service server listening on http://localhost:" + port);
}).catch((err) => {
    console.error("Failed to connect to DB");
    console.error(err);
    server.listen(port);
    console.log("Service started, but database connection failed.");
});

// Create a WebSocket server
const wss = new WebSocketServer({ server });
// Create a Map to track sessions and their participants
const sessions = new Map();
const clients = {};

wss.on('connection', (ws) => {   
    let session = null;
    let userId = null;
    let question = null;
    let sessionId = null;
    let finalCode = null;
    // Handle incoming messages
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'leaveSession') {
            finalCode = data.content;  // Capture the content
            handleEndSession(userId, sessionId, sessions, clients, session.questionId, finalCode);
        } else if (data.type === 'openSession') {
            sessionId = data.sessionId;
            userId = data.userId;
            question = data.question;
            console.log(`Creating session...${sessionId}...`)
            clients[userId] = ws; // Store the WebSocket connection

            // Check if the session already exists; if not, create one
            if (!sessions.has(sessionId)) {
                sessions.set(sessionId, {
                    participants: new Set(),
                    joinTimes: new Map(),
                    questionId: null
                });
            }
        
            // Add the connected client to the session's participant set
            session = sessions.get(sessionId);
            session.participants.add(userId);
        
            // Store the join time for the user
            session.joinTimes.set(userId, new Date());
        
            // Notify clients when a new client connects
            const connectedClientsCount = session.participants.size;
            if (connectedClientsCount == 1) {
                session.questionId = question
            }
            if (connectedClientsCount === 2) {
                for (const participant of session.participants) {
                    const client = clients[participant];
                    if (client && client.readyState === client.OPEN) {
                        client.send(JSON.stringify({
                            type: 'connectionStatus',
                            clientId: participant,
                            message: 'You are now connected to another user!',
                            connectedClients: connectedClientsCount,
                            question: session.questionId
                        }));
                    }
                }
            }
        } else {
            session.participants.forEach(client => {
                let clientWs = clients[client]
                if(client != userId)
                {
                    data.clientId = client;
                    clientWs.send(JSON.stringify(data))
                }
            })
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`Connection closed for user: ${userId} with code: ${code} and reason: ${reason.toString()}`); // Debug statement
        // Remove the client from the session participants
        const session = sessions.get(sessionId);
        if (session) {
            handleEndSession(userId, sessionId, sessions, clients, session.questionId, finalCode);
            session.participants.delete(userId)
            // Clean up participant data
            if (session.participants.size === 0) {
                sessions.delete(sessionId); // Clean up empty sessions
            }
        }
    });
});
