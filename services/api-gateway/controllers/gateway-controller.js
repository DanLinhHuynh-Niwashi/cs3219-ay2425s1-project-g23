import WebSocket from 'ws';
import { getMatchingServiceSocket, registerClient, unregisterClient } from '../routes/matching-socket.js';
import { registerClient as registerCollabClient, sendMessageToCollabService } from '../routes/collab-socket.js';

export const handleWSMessage = (ws, message, req) => {
  console.log(`Received message from client: ${message}`);
  const msg = JSON.parse(message);
  
  const clientId = msg.userId;
  switch (msg.service) {
    case 'matching':
      if(!clientId && !msg.ping) {
        ws.send(JSON.stringify({
          status: 500,
          message: 'Unknown incoming client.'
        }));
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

      case 'collaboration':
        const urlParams = req.url.split('/');
        const sessionId = urlParams[2];
        if(!clientId) {
          ws.send(JSON.stringify({
            status: 500,
            message: 'Unknown incoming client.'
          }));
          return;
        }
        registerCollabClient(sessionId, clientId, ws);
        sendMessageToCollabService(sessionId, msg);
        break;

    default:
        console.error('Unknown service type:', msg.service);
        ws.send(JSON.stringify({
            status: 500,
            message: 'Unknown service type:'
        }));
  }
};

export const handleHttpUploadFile = async (req, res, base_url, port, endpoint) => {
  try {
    
    const formData = new FormData(); 
    if (req.files && req.files.questionsFile) {
      const fileBlob = new Blob([req.files.questionsFile.data], { type: req.files.questionsFile.mimetype });
      formData.append("questionsFile", fileBlob, req.files.questionsFile.name);
      console.log (formData)
    } else {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const url = `${base_url}:${port}${endpoint}`;
    console.log(`Routing request to ${url}.`);

    // Make a POST request to the target service with the FormData
    const response = await fetch(url, {
      method: req.method,
      body: formData,
    });

    const data = await response.json();
    // Send the rest of the response to the client
    res.status(response.status).json(data);

  } catch (error) {
    console.log(error)
    res.status(500).json(error.message);
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