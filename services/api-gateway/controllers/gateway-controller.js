import axios from 'axios';
import WebSocket from 'ws';
import { getMatchingServiceSocket, registerClient, unregisterClient } from '../routes/matching-socket.js';

export const handleWSMessage = (ws, message) => {
  console.log(`Received message from client: ${message}`);
  const msg = JSON.parse(message);
  
  const clientId = msg.userId;
  switch (msg.service) {
    case 'matching':
      if(!clientId) {
        return;
      }
      registerClient(clientId, ws);
      const matchingSocket = getMatchingServiceSocket();

      if (matchingSocket && matchingSocket.readyState === WebSocket.OPEN) {
        matchingSocket.send(JSON.stringify(msg));
      } else {
        console.error('Cannot send message to matching service: socket is not open.');
        ws.send(JSON.stringify({
            status: 500,
            clientId: userId,
            message: 'Cannot send message to matching service: socket is not open.'
        }));
      }
      break;

    default:
        console.error('Unknown service type:', msg.service);
        ws.send(JSON.stringify({
            status: 500,
            clientId: userId,
            message: 'Unknown service type:'
        }));
  }
};

export const handleHttpRequest = async (req, res, base_url, port, endpoint) => {
  try {
    console.log(req.body)
    const url = `${base_url}:${port}${endpoint}`;
    console.log(`Routing request to ${url}.`);

    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : null,
    });
    const data = await response.json();
    // Send the rest of the response to the client
    res.status(response.status).json(data);

  } catch (error) {
    console.log(error)
    res.status(500).json(error.message);
  }
};

export const handleHttpCredentialRequest = async (req, res, base_url, port, endpoint) => {
  try {
    const url = `${base_url}:${port}${endpoint}`;
    console.log(req.body)
    console.log(`Routing request to ${url}.`);
    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : null,
      credentials: 'include',
    });
    const data = await response.json();
    // Send the rest of the response to the client
    res.status(response.status).json(data);

  } catch (error) {
    console.log(error)
    res.status(500).json(error.message);
  }
};

export const handleLoginRequest = async (req, res, base_url, port, endpoint) => {
  try {
    const url = `${base_url}:${port}${endpoint}`;
    console.log(req.body)
    console.log(`Routing request to ${url}.`);

    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(req.body),
      credentials: 'include',
    });

    const data = await response.json();
    console.log(data);
    if(response.ok) {
      res.cookie('token', data.data.accessToken);
      res.cookie('user_id', data.data.id.toString());
    }
    

    // Send the rest of the response to the client
    res.status(response.status).json(data);

  } catch (error) {
    console.log(error)
    res.status(500).json(error.message);
  }
};