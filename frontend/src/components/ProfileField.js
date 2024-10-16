import React from 'react';
import { Row, Col } from 'react-bootstrap';

function ProfileField({ fieldLeft, fieldRight, valueLeft, valueRight }) {
  return (
    <Row className="mb-4">
      <Col>
        {fieldLeft} {valueLeft}
      </Col>
      <Col>
        {fieldRight} {valueRight}
      </Col>
    </Row>
  );
}

export default ProfileField;