import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './PastAttemptCard.css';

const PastAttemptCard = ({ attempt, categoriesDict, searchTokens }) => {
  const navigate = useNavigate();

  // Handle navigation to attempt details page
  const handleCardClick = () => {
    navigate(`/attempts/${attempt.id}`); // Use _id to match your backend
  };

    // Function to highlight matched terms
    const highlightMatches = (text) => {
      if (!searchTokens || searchTokens.length === 0) return text;
  
      const regex = new RegExp(`(${searchTokens.join('|')})`, 'gi');
      return text.split(regex).map((part, i) =>
        searchTokens.some((token) => part.toLowerCase() === token.toLowerCase()) ? (
          <span key={i} className="highlight">
            {part}
          </span>
        ) : (
          part
        )
      );
    };

    // Function to equalize the description height for single-line descriptions
    const formatDescription = (description) => {
      const lines = description.split('\n');
      return lines.length < 2 ? `${description}\n` : description;
    };

      // Helper function to format, trim, and highlight the description
    const getDescription = (previewText) => {
      // Format the description for line breaks and apply highlighting
      const formattedDescription = formatDescription(previewText);

      // Apply highlighting to matched terms within the formatted text
      return highlightMatches(formattedDescription);
    };

  return (
    <Card className="past-attempt-card" onClick={handleCardClick}>
      <Card.Body>
        <Card.Title>{highlightMatches(attempt.title)}</Card.Title>
        <Card.Text className="attempt-description">
          {getDescription(attempt.description)}
        </Card.Text>

        <Card.Text className="attempt-date">
          Date Attempted: {new Date(attempt.attemptDateTime).toLocaleDateString()}
        </Card.Text>
        <Card.Text className="attempt-duration">
          Duration of Attempt: {attempt.duration} minutes
        </Card.Text>
        <div className="attempt-difficulty">
          <Badge
            bg={attempt.complexity === 'Easy' ? 'success' : attempt.complexity === 'Medium' ? 'warning' : 'danger'}
          >
            {attempt.complexity}
          </Badge>
        </div>
        <div className="attempt-categories mt-2">
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