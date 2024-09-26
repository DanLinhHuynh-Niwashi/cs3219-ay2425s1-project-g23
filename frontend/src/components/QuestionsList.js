import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import QuestionCard from './QuestionCard';
import './QuestionsList.css';

const QuestionsList = ({ questions, categoriesDict }) => { // accept categoriesDict as a prop
  return (
    <Container fluid className="questions-list-container">
      <Row className="questions-list-row">
        {questions.map((question) => (
          <Col xs={12} key={question.id} className="question-card-col">
            <QuestionCard question={question} categoriesDict={categoriesDict} /> {/* Pass categoriesDict */}
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default QuestionsList;
