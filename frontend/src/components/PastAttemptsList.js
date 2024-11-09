import React from 'react';
import { Row, Col } from 'react-bootstrap';
import PastAttemptCard from './PastAttemptCard';
import './PastAttemptsList.css';

const PastAttemptsList = ({ attempts, categoriesDict, searchTokens }) => {
  return (
    <div className="past-attempts-list">
      {attempts.map((attempt) => (
        <Row key={attempt.id} className="mb-3">
          <Col>
            <PastAttemptCard attempt={attempt} categoriesDict={categoriesDict} searchTokens={searchTokens}/>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default PastAttemptsList;
