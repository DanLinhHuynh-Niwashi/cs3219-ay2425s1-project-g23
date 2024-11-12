// src/components/QuestionsList.js
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import QuestionCard from './QuestionCard';
import './QuestionsList.css'; // Add custom styles if needed

const QuestionsList = ({ questions, categoriesDict, searchTokens=[] }) => {
  return (
    <div className="questions-list">
      {questions.map((question) => (
        <Row key={question.id} className="mb-3"> {/* Use Row to make each card a full-width row */}
          <Col>
            <QuestionCard question={question} categoriesDict={categoriesDict} searchTokens={searchTokens}/>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default QuestionsList;
