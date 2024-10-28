import React, { useState, useEffect, useRef } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './components/Layout';
import AppRoutes from './routes'; 
import Login from './pages/Login';
import Signup from './pages/Signup';
import Collaboration from './pages/Collaboration';
import ProtectedRoutes from './utils/ProtectedRoutes';
import RedirectRoutes from './utils/RedirectRoutes';
import MatchingService from './pages/MatchingService'; 
import { useModal } from './modalState'; // Import the custom modal hook

function App() {
  const { isModalOpen, closeModal } = useModal();
  const [ws, setWs] = useState(null);
  const intervalRef = useRef(null);
  const baseUrl = process.env.REACT_APP_MATCHING_API_URL || 'ws://localhost:3000';

  useEffect(() => {
    const websocket = new WebSocket(baseUrl);
    setWs(websocket);

    websocket.onopen = () => {
      console.log('WebSocket connection established.');

      // Ping to keep connection alive
      intervalRef.current = setInterval(() => {
        websocket.send(JSON.stringify({ ping: 1 }));
      }, 30000); // Send ping every 30 seconds
    };

    websocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      console.log('Message from WebSocket:', data);
    };

    websocket.onclose = (event) => {
      console.log('WebSocket closed:', event);
      clearInterval(intervalRef.current);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup
    return () => {
      if (websocket.readyState == WebSocket.OPEN) {
        websocket.close();
      }
      clearInterval(intervalRef.current);
    };
  }, [baseUrl]);

  return (
    <Router>
      {/* Render the MatchingService modal */}
      <MatchingService showModal={isModalOpen} handleClose={closeModal} ws={ws} />

      <Routes>
        <Route element={<RedirectRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        {/* All routes wrapped in Layout */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/*" element={<Layout />}>
            <Route path="*" element={<AppRoutes />} /> {/* Centralized routing under Layout */}
          </Route>
          <Route path="/session/:sessionId" element={<Collaboration/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
