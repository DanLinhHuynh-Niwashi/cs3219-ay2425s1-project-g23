import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './PastAttemptCard.css';

const PastAttemptCard = ({ attempt, categoriesDict }) => {
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
          Date Attempted: {new Date(attempt.attemptDateTime).toLocaleDateString()}
        </Card.Text>
        <Card.Text className="attempt-duration">
          Duration of Attempt: {attempt.duration} minutes
        </Card.Text>
        <div className="question-difficulty">
          <Badge
            bg={attempt.complexity === 'Easy' ? 'success' : attempt.complexity === 'Medium' ? 'warning' : 'danger'}
          >
            {attempt.complexity}
          </Badge>
        </div>
        <div className="question-categories mt-2">
          {attempt.categories && attempt.categories.length > 0 ? (
            attempt.categories.map((categoryId, index) => (
              <Badge
                key={index}
                bg="info"
                className="me-1"
                style={{ backgroundColor: '#D6BCFA' }}
              >
                {categoriesDict[categoryId] || "Unknown"}
              </Badge>
            ))
          ) : (
            <Badge bg="secondary">No Categories</Badge>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default PastAttemptCard;