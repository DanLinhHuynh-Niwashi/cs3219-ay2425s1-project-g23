import WebSocket from 'ws';

let matchingServiceSocket;
const clients = new Map();

export const connectToMatchingService = () => {
  const url = `${process.env.MATCHING_URL}:${process.env.MATCHING_PORT || 8080}`;
  matchingServiceSocket = new WebSocket(url);

  matchingServiceSocket.on('open', () => {
    console.log(`Connected to matching service on ${url}.`);
  });

  matchingServiceSocket.on('message', (message) => {
    const response = JSON.parse(message);
    console.log(`Message from matching service: ${message}`);
    console.log(clients)
    const client = clients.get(response.clientId);
    if (client) {
      client.send(JSON.stringify(response));
    }
  });

  matchingServiceSocket.on('close', () => {
    console.log('Connection to matching service closed. Attempting to reconnect...');
    setTimeout(() => connectToMatchingService(url), 5000);
  });

  matchingServiceSocket.on('error', (error) => {
    //console.error('WebSocket error:', error);
  });
};

export const getMatchingServiceSocket = () => matchingServiceSocket;

export const registerClient = (userID, ws) => {
  clients.set(userID, ws);

  ws.removeListener('close', unregisterClient);
  ws.on('close', () => {
    unregisterClient(userID);
  });
};

export const unregisterClient = (userID) => {
  clients.delete(userID);
};
