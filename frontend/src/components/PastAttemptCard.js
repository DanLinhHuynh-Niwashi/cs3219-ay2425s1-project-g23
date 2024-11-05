import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './PastAttemptCard.css';

const PastAttemptCard = ({ attempt }) => {
  const navigate = useNavigate();

  // Handle navigation to attempt details page
  const handleCardClick = () => {
    navigate(`/attempts/${attempt.id}`); // Use _id to match your backend
  };

  return (
    <Card className="past-attempt-card" onClick={handleCardClick}>
      <Card.Body>
        <Card.Title>{attempt.title}</Card.Title>
        <Card.Text className="attempt-date">
          Date: {new Date(attempt.attemptDateTime).toLocaleDateString()}
        </Card.Text>
        <Card.Text className="attempt-duration">
          Duration: {attempt.duration} mins
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default PastAttemptCard;