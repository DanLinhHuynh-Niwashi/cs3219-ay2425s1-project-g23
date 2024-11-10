import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Card, Badge, Form } from 'react-bootstrap';
import MonacoEditor from '@monaco-editor/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Collaboration.css';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getChatGPTResponse(prompt) {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching ChatGPT response:", error);
    return "There was an error processing your request.";
  }
}

function Collaboration() {
  const { category, sessionId } = useParams();
  const navigate = useNavigate();
  const [chosenQuestion, setChosenQuestion] = useState(null);
  const [syncedQuestion, setSyncedQuestion] = useState({
    id: '',
    description: '',
    title: '',
    complexity: '',
  });
  const [userId, setUserId] = useState(null);
  const [text, setText] = useState('');
  const [bothConnected, setBothConnected] = useState(false);
  const [webSocket, setWebSocket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPartnerLeftModal, setShowPartnerLeftModal] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [responseOutput, setResponseOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [elapsedTime, setElapsedTime] = useState(0); // Timer state in seconds
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);


  const questionUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:3000';
  const baseWsUrl = process.env.REACT_APP_COLLAB_WS_URL || 'http://localhost:3000';
  const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:3000';

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
    };

    // Prevent back button navigation
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, document.title, window.location.href);
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', handlePopState);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom every time a new message is added
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

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
        if (!token || !id) throw new Error(`Did not retrieve cookies; invalid authentication`);
        setUserId(id);
      } catch (error) {
        console.error('Error fetching User ID:', error);
      }
    };
    fetchUserID();
  }, []);

  useEffect(() => {
    const fetchRandomQuestion = async () => {
      const filters = category.split("-");
      const response = await fetch(`${questionUrl}/questions/random/${filters[0]}/${filters[1]}`);
      const data = await response.json();
      setChosenQuestion(data._id);
    };
    fetchRandomQuestion();
  }, [userId]);

  useEffect(() => {
    const getSessionQuestion = async (id) => {
      const response = await fetch(`${questionUrl}/questions/${id}`);
      const data = await response.json();
      if (response.status == 404) {
        navigate('/questions')
        alert("No questions found for the selected difficulty and topic. Please try a different combination.");
        if (webSocket)
          webSocket.close();
      }
      setSyncedQuestion(data.data);
    };
    if (userId) {
      let ws = new WebSocket(`${baseWsUrl}/${sessionId}`);
      setWebSocket(ws);
      ws.onopen = () => {
        console.log("WebSocket connection opened");
        ws.send(JSON.stringify(
          { type: "openSession", userId, question: chosenQuestion, sessionId: sessionId, service: "collaboration" }
        ))
      };
      ws.onclose = () =>
        console.log(`WebSocket connection closed for user ${userId}`);
      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        switch (data.type) {
          case 'connectionStatus':
            setBothConnected(data.connectedClients === 2);
            getSessionQuestion(data.question);
            break;
          case 'message':
            setText(data.message);
            break;
          case 'partnerLeft':
            setShowPartnerLeftModal(true);
            break;
          case 'sessionEnded':
            navigateToSummary();
            ws.close();
            break;
          case 'disconnection':
            setBothConnected(false);
            navigateToSummary();
            ws.close();
            break;
          case 'chatMessage':
            const receivedMessage = {
              text: data.message,
              sender: 'other'
            };
            setChatMessages((prevMessages) => [...prevMessages, receivedMessage]);
          default:
            break;
        }
      };
    }
  }, [chosenQuestion, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLeaveClick = () => setShowModal(true);
  const handleConfirmLeave = async () => {
    if (webSocket) {
      const finalContent = text;
      webSocket.send(JSON.stringify({ type: "leaveSession", content: finalContent, service: "collaboration" }));  // Notify server      setBothConnected(false);
      //setBothConnected(false);
      await sleep(1000);
      navigateToSummary();
      webSocket.close();
    }
    setShowModal(false);
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      const myMessage = {
        text: chatInput,
        sender: 'me'
      };
      webSocket.send(JSON.stringify({ type: 'chatMessage', message: myMessage.text, userId, service: "collaboration" }));
      setChatMessages((prevMessages) => [...prevMessages, myMessage]);
      setChatInput('');
    }
  };

  const navigateToSummary = async () => {
    try {
      const response = await fetch(`${baseUrl}/collab/session-summary/${sessionId}`);
      if (response.ok) {
        const sessionSummaryData = await response.json();
        navigate(`/summary`, { state: { sessionSummary: sessionSummaryData } });
      } else {
        console.error("Failed to retrieve session summary for redirection.");
        navigate(`/questions`)
      }
    } catch (error) {
      console.error("Error fetching session summary:", error);
      navigate(`/questions`)
    }
  };

  const handleTextChange = (newText) => {
    setText(newText);
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: 'message', message: newText, userId, service: "collaboration" }));
    }
  };

  const handleChatGPTSubmit = async () => {
    const response = await getChatGPTResponse(promptInput);
    setResponseOutput(response);
  };

  return (
    <div className="collaboration-container">
      <div className="question-and-chatgpt">
        <Card className="question-card">
          <Card.Body>
            <Card.Title>{syncedQuestion.title}</Card.Title>
            <Card.Text>{syncedQuestion.description}</Card.Text>
            <Badge variant="info">{syncedQuestion.complexity}</Badge>
          </Card.Body>
        </Card>

        <div className="chatgpt-box">
          <div className="chatgpt-response">{responseOutput}</div>
          <Form.Control
            as="textarea"
            rows={2}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ask ChatGPT..."
          />
          <Button variant="primary" onClick={handleChatGPTSubmit}>
            Send
          </Button>
        </div>

        <div className="session-info">
          <div className={`status ${bothConnected ? 'connected' : 'disconnected'}`}>
            {bothConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="timer">Session Duration: {formatElapsedTime()}</div>
        </div>
        <Button variant="danger" className="leave-button" onClick={handleLeaveClick}>
          Leave Session
        </Button>
      </div>

      <div className="editor-container">
        <MonacoEditor
          height="100%"
          width="100%"
          language={language}
          theme="vs-dark"
          value={text}
          onChange={handleTextChange}
          options={{ lineNumbers: 'on', selectOnLineNumbers: true }}
        />
        <Form.Select
          onChange={(e) => setLanguage(e.target.value)}
          value={language}
          className="language-selector"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </Form.Select>
      </div>

      <div className="chat-box card" style={{ borderColor: 'rgb(211, 211, 211)' }}>
        <div className="card-header text-center">
          <h5>Session Chat</h5>
        </div>
        <div className="card-body">
          <div className="message-display" style={{ height: '300px', overflowY: 'auto' }}>
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex ${msg.sender === 'me' ? 'justify-content-end' : 'justify-content-start'} mb-1`}
              >
                <div className={`message p-2 rounded ${msg.sender === 'me' ? 'bg-secondary text-white' : 'bg-light text-dark'}`}
                  style={{ maxWidth: '75%', wordWrap: 'break-word' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="input-area d-flex mt-2">
            <input
              type="text"
              className="form-control me-2"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="btn btn-primary" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to end the session?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleConfirmLeave}>Yes, End Session</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPartnerLeftModal} onHide={() => setShowPartnerLeftModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>Your partner has left the session.</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              setShowPartnerLeftModal(false); // Close the modal
              handleConfirmLeave();
            }}
          >
            Go to Summary
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Collaboration;
