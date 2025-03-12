import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import './SessionSummaryPage.css';
import { fetchUserNameById } from '../models/userModel';

const SessionSummaryPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { sessionSummary: initialSessionSummary } = location.state || {};
    const [sessionSummary, setSessionSummary] = useState(initialSessionSummary);
    console.log("Location state:", location.state);

    useEffect(() => {
        const fetchUsernames = async () => {
            if (initialSessionSummary && initialSessionSummary.participants) {
                console.log("Fetching usernames with initial session summary:", initialSessionSummary);
        
                const updatedParticipants = await Promise.all(
                    initialSessionSummary.participants.map(async (participant) => {
                        try {
                            console.log(`Fetching username for userId ${participant.userId}`);
                            const response = await fetchUserNameById(participant.userId);
                            
                            if (response.ok) {
                                const responseData = await response.json();
                                console.log(`Fetched username for userId ${participant.userId}:`, responseData.data.username);
                                return {
                                    ...participant,
                                    username: responseData.data.username, 
                                };
                            } else {
                                console.error(`Error fetching username for userId ${participant.userId}:`, response.statusText);
                                return { ...participant, username: 'Unknown User' };
                            }
                        } catch (error) {
                            console.error(`Error fetching username for userId ${participant.userId}:`, error);
                            return { ...participant, username: 'Unknown User' };
                        }
                    })
                );
        
                console.log("Updated participants with usernames:", updatedParticipants);
                setSessionSummary((prevSummary) => ({
                    ...prevSummary,
                    participants: updatedParticipants,
                }));
            }
        };
        
    
        if (initialSessionSummary) {
            fetchUsernames();
        }
    }, [initialSessionSummary]);
    

    const handleReturnToQuestions = () => {
        navigate('/questions');
    };

    const formattedDate = sessionSummary?.dateTime
    ? new Date(sessionSummary.dateTime).toLocaleString("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23" // 24-hour format
      })
    : '';

    return (
        <Container className="mt-4">
            <h1 className="text-center">Session Summary</h1>
            {sessionSummary ? (
                <Card className="summary-card">
                    <Card.Body>
                        <Row>
                            <Col>
                                <Card.Title>Session ID: {sessionSummary.sessionId}</Card.Title>
                                <Card.Text>
                                    <strong>Participants:</strong>{' '}
                                    {sessionSummary.participants.map((participant, index) => (
                                        <span key={index}>
                                            {participant.username || 'Unknown User'}
                                            {index < sessionSummary.participants.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Date Attempted:</strong> {formattedDate}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Duration of Attempt:</strong> {sessionSummary.duration} minutes
                                </Card.Text>
                                <Card.Text>
                                    <strong>Attempted Code:</strong>
                                    <p>{sessionSummary.attemptedCode}</p>
                                </Card.Text>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="text-center">
                    <Card.Body>
                        <Card.Title>No Session Summary Available</Card.Title>
                    </Card.Body>
                </Card>
            )}
            <div className="text-center mt-3">
                <Button variant="primary" onClick={handleReturnToQuestions}>
                    Return to Questions Page
                </Button>
            </div>
        </Container>
    );
};

export default SessionSummaryPage;
