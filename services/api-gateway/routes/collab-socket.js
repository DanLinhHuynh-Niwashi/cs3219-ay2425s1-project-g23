import WebSocket from 'ws';
const sessionConnections = new Map(); // Maps sessionId -> collabSession WebSocket
const userConnections = new Map(); // Maps sessionId -> Map of userId -> user WebSocket

// Function to initialize or retrieve a collabSession WebSocket for a given sessionId
function getOrCreateCollabSessionConnection(sessionId) {
  if (sessionConnections.has(sessionId)) {
    console.log(`Reusing existing collabSession WebSocket for session: ${sessionId}`);
    return sessionConnections.get(sessionId);
  }

  // Create a new WebSocket connection to the collaboration service for this sessionId
  const url = `${process.env.COLLAB_URL}:${process.env.COLLAB_PORT || 8081}/${sessionId}`;
  const collabSessionWs = new WebSocket(url);

  collabSessionWs.on('open', () => {
    console.log(`Connected to collaboration service for session: ${sessionId}`);
  });

  collabSessionWs.on('message', (message) => {
    console.log(`Message from collaboration service for session ${sessionId}: ${message}`);
    
    const response = JSON.parse(message);
    const clients = userConnections.get(sessionId);
    if (clients && clients.has(response.clientId)) {
      const client = clients.get(response.clientId);
      if (client.readyState === WebSocket.OPEN) {
        console.log(JSON.stringify(response))
        client.send(JSON.stringify(response)); // Send the message directly to the target user
      } else {
        console.error(`User WebSocket for userId ${response.clientId} is not open.`);
      }
    } else {
      console.error(`No WebSocket found for userId ${response.clientId} in session ${sessionId}.`);
    }
  });

  collabSessionWs.on('close', () => {
    console.log(`Collaboration session WebSocket for session ${sessionId} closed.`);
    sessionConnections.delete(sessionId); // Remove the session WebSocket from the pool
    userConnections.delete(sessionId); // Clear all user connections associated with the session
  });

  collabSessionWs.on('error', (error) => {
    console.error(`WebSocket error for collaboration session ${sessionId}:`, error);
  });

  // Store the session connection in the pool
  sessionConnections.set(sessionId, collabSessionWs);
  return collabSessionWs;
}

// Function to send a message from a user to the collaboration service via collabSessionWs
export function sendMessageToCollabService(sessionId, message) {
  const collabSessionWs = getOrCreateCollabSessionConnection(sessionId);

  if (collabSessionWs.readyState === WebSocket.OPEN) {
    collabSessionWs.send(JSON.stringify(message));
  } else {
    console.error(`Collaboration session WebSocket for session ${sessionId} is not open.`);
  }
};

// Function to unregister a user WebSocket connection for a given sessionId and userId
export function unregisterClient(sessionId, userId, collabSessionWs) {
  console.log(`User WebSocket disconnected for userId ${userId} in session ${sessionId}`);
  const userWsMap = userConnections.get(sessionId);
  if (userWsMap) {
    userWsMap.delete(userId);
    // If no more users remain in this session, close the session WebSocket
    if (userWsMap.size === 0) {
      collabSessionWs.close();
    }
  }
}

// Function to register a user WebSocket connection for a given sessionId and userId
export function registerClient(sessionId, userId, userWs) {
  const collabSessionWs = getOrCreateCollabSessionConnection(sessionId);

  if (!userConnections.has(sessionId)) {
    userConnections.set(sessionId, new Map());
  }
  userConnections.get(sessionId).set(userId, userWs);

  userWs.on('close', () => {
    unregisterClient(sessionId, userId, collabSessionWs);
  });
};
