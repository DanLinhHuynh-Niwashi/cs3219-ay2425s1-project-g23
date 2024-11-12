import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './QuestionCard.css';

const QuestionCard = ({ question, categoriesDict, searchTokens = [] }) => {
  const navigate = useNavigate();
  const previewLength = 100;

  const handleCardClick = () => {
    navigate(`/questions/${question.id}`);
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
    <Card className="question-card" onClick={handleCardClick}>
      <Card.Body>
        <Card.Title>{highlightMatches(question.title)}</Card.Title>
        
        <Card.Text className="question-description">
          {getDescription(question.description)}
        </Card.Text>
        
        <div className="question-difficulty">
          <Badge
            bg={
              question.complexity === 'Easy'
                ? 'success'
                : question.complexity === 'Medium'
                ? 'warning'
                : 'danger'
            }
          >
            {question.complexity}
          </Badge>
        </div>
        <div className="question-categories mt-2">
          {question.categories && question.categories.length > 0 ? (
            question.categories.map((categoryId, index) => (
              <Badge
                key={index}
                bg="info"
                className="me-1"
                style={{ backgroundColor: '#D6BCFA' }}
              >
                {categoriesDict[categoryId] || 'Unknown'}
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

export default QuestionCard;
