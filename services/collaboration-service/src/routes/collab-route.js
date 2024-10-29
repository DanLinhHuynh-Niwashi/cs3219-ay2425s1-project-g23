import { json } from 'express';
import WebSocket from 'ws'; 
let sessions = {}; // {SessionID : {UserID1 : WebSocket1, UserID2 : WebSocket2}}

export function setupRoutes(wss) { 
    wss.on('connection', (ws, req) => {
        const url = req.url.split('/')
        const user = url.pop();
        const sessionId = url.pop();
        if (sessions[sessionId]) {
            sessions[sessionId][user] = ws;
            Object.values(sessions[sessionId]).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'connection', message: 'Both users are now connected.' }));
                }
            });
        } else {
            sessions[sessionId] = {[user]: ws}
        }
        ws.on('message', (message) => { 
            const parsedMessage = JSON.parse(message);
            Object.values(sessions[sessionId]).forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        });
        ws.on('close', () => { 
            if (sessions[sessionId].length == 1) {
                delete sessions[sessionId];
            } else {
                Object.values(sessions[sessionId]).forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'disconnection', message: 'The other user has disconnected.' }));
                        client.close(); 
                        delete sessions[sessionId][user];
                    }
                });
            }
        }); 
    });
}
