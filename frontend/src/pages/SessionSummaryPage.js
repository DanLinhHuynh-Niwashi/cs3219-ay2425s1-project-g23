import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import './SessionSummaryPage.css'; // Assuming you create a CSS file for additional styles

const SessionSummaryPage = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Initialize the navigate function
    const { sessionSummary } = location.state || {}; // Get the session summary from state
    console.log(sessionSummary);

    const handleReturnToQuestions = () => {
        navigate('/questions'); // Navigate to the questions page
    };

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
                                <strong>Participants:</strong> {sessionSummary.participants.map(participant => participant.userId).join(', ')}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Duration:</strong> {sessionSummary.duration} seconds
                                </Card.Text>
                                <Card.Text>
                                    <strong>Date:</strong> {sessionSummary.dateTime}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Summary Notes:</strong>
                                    <p>{sessionSummary.summaryNotes}</p>
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


