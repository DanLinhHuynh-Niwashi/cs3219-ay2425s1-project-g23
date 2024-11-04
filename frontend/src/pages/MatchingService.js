import React, { useState, useEffect } from 'react';
import { Button, Modal, Alert, Form, Spinner } from 'react-bootstrap';
import { triggerModalOpen } from '../modalState'
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import './MatchingService.css';

const MatchingService = ({ showModal, handleClose, ws }) => {
    const [difficulty, setDifficulty] = useState('');
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [userId, setUserId] = useState('');
    //const [topics, setTopics] = useState([]);
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setSubmitting] = useState(false);
    const [isInQueue, setIsInQueue] = useState(false);
    const [showStayButton, setShowStayButton] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [timer, setTimer] = useState(0); // New state for timer
    const navigate = useNavigate();

    const baseUrl = process.env.REACT_APP_QUESTION_API_URL || 'http://localhost:3000';

    useEffect(() => {
        // Timer logic
        let timerInterval = null;
        if (isMatching) {
            timerInterval = setInterval(() => {
                setTimer(prevTime => prevTime + 1);
            }, 1000); // Increment timer every second
        } else {
            setTimer(0); // Reset timer when matching is stopped
        }

        return () => clearInterval(timerInterval); // Cleanup interval on unmount
    }, [isMatching]);

    useEffect(() => {
        // get user id
        const fetchUserID = async () => {
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
                setError('Could not retrieve userID. Please try again.');
            }
        };

        // get question categories
        const fetchCategories = async () => {
            try {
                const categoriesResponse = await fetch(`${baseUrl}/categories`);
                if (!categoriesResponse.ok) {
                    throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
                }
                const categoriesData = await categoriesResponse.json();

                console.log('Fetched categories:', categoriesData); // Log the fetched data

                const formattedCategories = categoriesData.data.map(category => ({
                    value: category.id,
                    label: category.name,
                }));

                setCategories(formattedCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Could not retrieve categories. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserID();
        fetchCategories();

        if (!ws) return; // Exit if WebSocket is not available

        const timeoutId = setTimeout(() => {
            if (isInQueue) {
                setShowStayButton(true);
            }
        }, 10000); // 10 seconds

        const handleMessage = (message) => {
            const data = JSON.parse(message.data);
            switch (data.status) {
                case 'matching':
                    // Update UI for matching in progress
                    setIsMatching(true)
                    break;
                case 'success':
                    // Notify match found
                    navigate(`/session/${data.topic}-${data.difficulty}/${data.sessionId}`)
                    handleClose(); // Close modal on successful match
                    cleanup();
                    break;
                case 'timeout':
                    // Handle error messages
                    setShowStayButton(true);
                    setError(data.message);
                    triggerModalOpen();
                    break;
                case 'leave':
                    handleClose();
                    cleanup();
                case 500:
                    // Handle error messages
                    handleClose();
                    cleanup();
                    break;
                default:
                    console.log(`Unknown message: ${message.data}`);
            }
        };

        ws.addEventListener('message', handleMessage);

        // Cleanup on component unmount
        return () => {
            ws.removeEventListener('message', handleMessage);
            clearTimeout(timeoutId);
        };

    }, [showModal, ws, handleClose]);

    const handleSubmit = (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null); // Reset error state

        //if (topics.length === 0 || !difficulty) { 
        if (!topic || !difficulty) {
            setError('Please fill in all required fields.');
            setSubmitting(false);
            return;
        }

        // Show error if already in queue
        if (isInQueue) {
            setError('You are already in the queue. Please wait for a match.');
            handleClose(); // Close the modal
            setSubmitting(false);
            return;
        }

        const requestData = {
            event: 'joinQueue',
            userId,
            //topics: topics,
            topic,
            difficulty,
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(requestData)); // Send join request to server
            setIsInQueue(true); // Set user in queue state
        } else {
            setError('WebSocket connection is not open. Please try again later.');
        }
        setSubmitting(false);
    };

    const cleanup = () => {
        setError(null);
        setDifficulty(null);
        //setTopics([]);
        setTopic('');
        setIsMatching(false);
        setSubmitting(false);
        setIsInQueue(false);
        setShowStayButton(false);
    }

    const handleTopicChange = (selectedOption) => {
        // Set topic to the label or value of the selected option
        setTopic(selectedOption ? selectedOption.label : ''); // Handle case for no selection
    };
    const handleLeaveQueue = () => {
        setSubmitting(true);
        setError(null);
        try {
            const requestData = {
                event: 'leaveQueue',
                userId,
                //topics: topics,
                topic,
                difficulty,
            };

            // Check if WebSocket is open before sending
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(requestData)); // Send leave request to server
                setIsInQueue(false); // Reset queue state
                setUserId(''); // Clear userId
                //setTopics([]); // Clear topic
                setTopic('');
                setDifficulty('easy'); // Reset to default difficulty
                handleClose(); // Close the modal after leaving
            } else {
                setError('WebSocket connection is not open. Please try again later.');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleStayInQueue = () => {
        setSubmitting(true);
        setError(null);
        try {
            // Check if WebSocket is open before sending
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ event: 'stayInQueue' }));
            } else {
                setError('WebSocket connection is not open. Please try again later.');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
            setShowStayButton(false);
        }
    };

    return (
        <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header className="justify-content-center">
                <Modal.Title>Start New Session</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column align-items-center">
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit} className="w-100">
                    <Form.Group controlId="difficulty" className="mt-3">
                        <div className="d-flex align-items-center justify-content-center">
                            <Form.Label className="me-3">Difficulty</Form.Label>
                            <div className="difficulty-buttons">
                                <Button
                                    variant={difficulty === 'Easy' ? 'success' : 'primary'}
                                    onClick={() => setDifficulty('Easy')}
                                    disabled={isMatching}
                                >
                                    Easy
                                </Button>
                                <Button
                                    variant={difficulty === 'Medium' ? 'warning' : 'primary'}
                                    onClick={() => setDifficulty('Medium')}
                                    disabled={isMatching}
                                >
                                    Medium
                                </Button>
                                <Button
                                    variant={difficulty === 'Hard' ? 'danger' : 'primary'}
                                    onClick={() => setDifficulty('Hard')}
                                    disabled={isMatching}
                                >
                                    Hard
                                </Button>
                            </div>
                        </div>
                    </Form.Group>



                    {/*<Form.Group controlId="topics" className="mt-3">*/}
                    <Form.Group controlId="topic" className="mt-3">
                        <div className="d-flex align-items-center">
                            <Form.Label className="me-3">Topics</Form.Label>
                            <Select
                                options={categories}
                                value={categories.find(category => category.label === topic)}
                                onChange={handleTopicChange}
                                className="basic-multi-select flex-grow-1"
                                classNamePrefix="select"
                                placeholder="Select topics..."
                                isDisabled={isMatching} // Disable Select while matching
                            />
                        </div>
                    </Form.Group>

                    {isMatching && (
                        <div className="text-center mt-3">
                            <Spinner animation="border" role="status" />
                            <span className="ms-2">Matching, please wait... {timer}s</span> {/* Timer displayed here */}
                        </div>
                    )}

                </Form>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                {!isInQueue ? (
                    <Button
                        disabled={isSubmitting}
                        variant="primary"
                        type="submit"
                        className="mt-3"
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'Joining...' : 'Join Queue'}
                    </Button>
                ) : (
                    <>
                        <Button
                            disabled={isSubmitting}
                            variant="danger"
                            onClick={handleLeaveQueue}
                            className="mt-3"
                        >
                            {isSubmitting ? 'Leaving...' : 'Leave Queue'}
                        </Button>
                        {showStayButton && (
                            <Button
                                variant="primary"
                                onClick={handleStayInQueue}
                                className="mt-3"
                            >
                                Stay in Queue
                            </Button>
                        )}
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};


export default MatchingService;