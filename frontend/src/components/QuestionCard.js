import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './QuestionCard.css';

const QuestionCard = ({ question, categoriesDict }) => { // Accept categoriesDict as a prop
  const navigate = useNavigate();

  // Function to handle click and navigate to question details page
  const handleCardClick = () => {
    navigate(`/questions/${question.id}`);
  };

  // Function to equalize the description height
  const formatDescription = (description) => {
    const lines = description.split('\n');
    return lines.length < 2 ? `${description}\n` : description;
  };

  return (
    <Card className="question-card" onClick={handleCardClick}>
      <Card.Body>
        <Card.Title>{question.title}</Card.Title>
        <Card.Text className="question-description">
          {formatDescription(question.description)}
        </Card.Text>
        <div className="question-difficulty">
          <Badge
            bg={question.complexity === 'easy' ? 'success' : question.complexity === 'medium' ? 'warning' : 'danger'}
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
                {categoriesDict[categoryId] || "Unknown"} {/* Use categoriesDict to get name */}
              </Badge>
            ))
          ) : (
            <Badge bg="secondary">No Categories</Badge> /* Fallback for no categories */
          )}
        </div>
        <div className="view-question mt-3">
          <Button onClick={handleCardClick}>View Question →</Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default QuestionCard;
