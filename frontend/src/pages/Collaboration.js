import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal, Container, Row, Col, Form } from 'react-bootstrap';
import Editor from '@monaco-editor/react';
import 'bootstrap/dist/css/bootstrap.min.css';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  const [language, setLanguage] = useState('javascript');

  const questionUrl = process.env.REACT_APP_QUESTION_API_URL || 'http://localhost:3000';
  const baseWsUrl = process.env.REACT_APP_COLLAB_WS_URL || 'http://localhost:3000';
  const baseUrl = process.env.REACT_APP_COLLAB_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const handleBeforeUnload = (e) => e.preventDefault();

    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, document.title, window.location.href);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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
        if (!token || !id) throw new Error('Invalid authentication');
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
      if (response.status === 404) {
        alert("No questions found. Try a different combination.");
        navigate('/questions');
      }
      setSyncedQuestion(data.data);
    };

    if (userId) {
      const ws = new WebSocket(`${baseWsUrl}/${sessionId}/${userId}/${chosenQuestion}`);
      setWebSocket(ws);
      ws.onopen = () => console.log("WebSocket connection opened");
      ws.onclose = () => navigateToSummary();

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
          case 'disconnection':
            setBothConnected(false);
            navigateToSummary();
            break;
          default:
            break;
        }
      };
    }
  }, [chosenQuestion, navigate]);

  const handleLeaveClick = () => setShowModal(true);

  const handleConfirmLeave = async () => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: "leaveSession", userId }));
      setBothConnected(false);
      await sleep(100);
      navigateToSummary();
    }
    setShowModal(false);
  };

  const navigateToSummary = async () => {
    try {
      const response = await fetch(`${baseUrl}/collab/session-summary/${sessionId}`);
      if (response.ok) {
        const sessionSummaryData = await response.json();
        navigate(`/summary`, { state: { sessionSummary: sessionSummaryData } });
      } else {
        console.error("Failed to retrieve session summary.");
      }
    } catch (error) {
      console.error("Error fetching session summary:", error);
    }
  };

  const handleTextChange = (newText) => {
    setText(newText);
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: 'message', message: newText }));
    }
  };

  return (
    <Container fluid className="mt-5">
      <Row className="mb-4 text-center">
        <Col>
          <div className={`p-4 text-white rounded ${bothConnected ? 'bg-success' : 'bg-danger'}`}>
            {bothConnected ? 'Connected' : 'Disconnected'}
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={4} className="text-left p-3">
          <h3>{syncedQuestion.title}</h3>
          <p>{syncedQuestion.description}</p>
          <p><strong>Difficulty:</strong> {syncedQuestion.complexity}</p>
        </Col>
        <Col xs={8} className="p-3">
          <Form.Group controlId="languageSelect" className="mb-3">
            <Form.Label>Select Language</Form.Label>
            <Form.Control as="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </Form.Control>
          </Form.Group>
          <Editor
            height="400px"
            language={language}
            value={text}
            onChange={(value) => handleTextChange(value)}
            theme="vs-dark"
          />
        </Col>
      </Row>

      <Button variant="danger" onClick={handleLeaveClick} className="mt-3">Leave</Button>

      {/* Confirmation modal for leaving */}
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

      {/* Partner left notification modal */}
      <Modal show={showPartnerLeftModal} onHide={() => setShowPartnerLeftModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>Your partner has left the session. Redirecting to summary page...</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => navigateToSummary()}>Go to Summary</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Collaboration;
