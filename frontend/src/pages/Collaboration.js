import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function Collaboration() {
  const { category, sessionId } = useParams();
  const navigate = useNavigate()
  const [chosenQuestion, setChosenQuestion] = useState(null);
  const [syncedQuestion, setSyncedQuestion] = useState({
    id: '',
    description: '',
    title: '',
    complexity: '',
  })
  const [userId, setUserId] = useState(null);
  const [text, setText] = useState('');
  const [bothConnected, setBothConnected] = useState(false);
  const [webSocket, setWebSocket] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [showPartnerLeftModal, setShowPartnerLeftModal] = useState(false);
  const [joinTime, setJoinTime] = useState(null); // Initialize joinTime state

  const questionUrl = process.env.REACT_APP_QUESTION_API_URL || 'http://localhost:3000';
  const baseWsUrl = process.env.REACT_APP_COLLAB_WS_URL || 'http://localhost:3000';
  const baseUrl = process.env.REACT_APP_COLLAB_API_URL || 'http://localhost:3000';


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
    const fetchRandomQuestion = async () => {
      let filters = category.split("-")
      let response = await fetch(`${questionUrl}/questions/random/${filters[0]}/${filters[1]}`);
      const data = await response.json();
      setChosenQuestion(data._id)
    };
    fetchRandomQuestion();
  }, [userId]);
  useEffect(() => {
    const getSessionQuestion = async (id) => {
      let response = await fetch(`${questionUrl}/questions/${id}`);
      const data = await response.json();
      if (response.status == 404) {
        alert("No questions found for the selected difficulty and topic. Please try a different combination.");
        navigate('/questions')
      }
      setSyncedQuestion(data.data);
    };
    if (userId) {
      let ws = new WebSocket(`${baseWsUrl}/${sessionId}/${userId}/${chosenQuestion}`);
      setWebSocket(ws);
      ws.onopen = () => {
        console.log("WebSocket connection opened");
      };
      ws.onclose = () =>
        navigateToSummary();
        console.log(`WebSocket connection closed for user ${userId}`);
      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        console.log(data)
        switch (data.type) {
          case 'connectionStatus':
            console.log(data)
            setBothConnected(data.connectedClients == 2);
            getSessionQuestion(data.question);
            break;
          case 'message':
            setText(data.message);
            break;
          case 'partnerLeft':
            setShowPartnerLeftModal(true); // Show partner-left modal
            console.log(data.message);
            break;
          case 'sessionEnded':
            console.log(data.message)
            navigateToSummary();
            break;
          case 'disconnection':
            setBothConnected(false);
            navigateToSummary();
            break;
          default:
            break;
        }
      }
    }
  }, [chosenQuestion, navigate]);

  const handleLeaveClick = () => {
    setShowModal(true); // Show the confirmation modal
  };

  const handleConfirmLeave = async () => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: "leaveSession", userId }));  // Notify server
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
        console.log("Navigating to summary page with data:", sessionSummaryData);
        navigate(`/summary`, { state: { sessionSummary: sessionSummaryData } });
      } else {
        console.error("Failed to retrieve session summary for redirection.");
      }
    } catch (error) {
      console.error("Error fetching session summary:", error);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: 'message', message: newText }));
    }
  };

  return (
    <div className="text-center mt-5">
      <div
        className={`p-4 text-white rounded ${bothConnected ? 'bg-success' : 'bg-danger'}`}
        style={{ width: '200px', margin: '0 auto' }}
      >
        {bothConnected ? 'Connected' : 'Disconnected'}
      </div>
      <button onClick={handleLeaveClick}>Leave</button>
      <textarea
        value={text}
        onChange={handleTextChange}
        rows={10}
        cols={50}
        placeholder="Type here..."
        style={{ width: '100%', fontSize: '16px' }}
      />
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to end the session?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmLeave}>
            Yes, End Session
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Partner left notification modal */}
      <Modal show={showPartnerLeftModal} onHide={() => setShowPartnerLeftModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your partner has left the session. You will be redirected to the session summary page in 10 seconds.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              webSocket.close();
              //navigateToSummary();  // Navigate to the summary page immediately
              setShowPartnerLeftModal(false); // Close the modal
            }}
          >
            Go to Summary
          </Button>
        </Modal.Footer>
      </Modal>
      {bothConnected && <div>
        <h1>
          {syncedQuestion.title}
        </h1>
        <div>
          {syncedQuestion.description}
        </div>
      </div>}
    </div>
  );
}

export default Collaboration