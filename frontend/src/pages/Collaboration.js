import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
function Collaboration() {
  const { sessionId } = useParams();
  const navigate = useNavigate()
  const [userId, setUserId] = useState(null);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const [webSocket, setWebSocket] = useState(null);
  useEffect(() => {
    const fetchUserID = () => {
      try {
        const cookie = document.cookie.split(';');
        const cookiesObject = cookie.reduce((acc, curr) => {
          const [key, value] = curr.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        const token = cookiesObject['token'] || '';
        const id = cookiesObject['user_id'] || '';
        if (token.length == 0 || id.length == 0) {
          throw new Error(`Did not retreive cookies invalid authentication`)
        }
        setUserId(id);
      } catch (error) {
        console.error('Error fetching User ID:', error);
      }
    };
    fetchUserID();
  }, []);
  useEffect(() => {
    if (userId) {
      let ws = new WebSocket(`ws://localhost:8081/${sessionId}/${userId}`);
      setWebSocket(ws);
      ws.onopen = () => {
        console.log("WebSocket connection opened");
      };
      ws.onclose = () => {
        console.log("WebSocket connection closed");
        navigate('/questions');
      };
      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        switch (data.type) {
          case 'connection':
            setConnected(true);
            break;
          case 'message':
            setText(data.message);
            break;
        }
      }
    }
  }, [userId]);

  const handleLeave = () => {
    if (webSocket) {
      webSocket.close();
      console.log("WebSocket connection closed by user.");
      setWebSocket(null);
      setConnected(false);
      navigate('/questions')
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    if (webSocket) {
      webSocket.send(JSON.stringify({type: 'message', message: newText}));
    }
  };

  return (
    <div className="text-center mt-5">
      <div
        className={`p-4 text-white rounded ${connected ? 'bg-success' : 'bg-danger'}`}
        style={{ width: '200px', margin: '0 auto' }}
      >
        {connected ? 'Connected' : 'Disconnected'}
      </div>
      <button onClick={handleLeave}>Leave</button>
      <textarea
        value={text}
        onChange={handleTextChange}
        rows={10}
        cols={50}
        placeholder="Type here..."
        style={{ width: '100%', fontSize: '16px' }}
      />
    </div>
  )
}

export default Collaboration