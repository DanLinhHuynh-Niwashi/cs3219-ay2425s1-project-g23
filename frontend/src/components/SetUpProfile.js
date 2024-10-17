import React from 'react';
import { Row, Col, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


function SetUpProfile() {
  const navigate = useNavigate()
  return (
    <Container style={{ height: '350px' }} className="text-center d-flex flex-column justify-content-center py-5">
      <Row>
        <Col>
          <h2 style={{ color: '#4A4A4A', fontWeight: 'bold', marginBottom: '30px' }}>Profile not created, create one now!</h2>
          <Button variant="primary" className="mt-3" onClick={() => navigate('/editProfile')}>Create Profile</Button>
        </Col>
      </Row>
    </Container>
  )
}

export default SetUpProfile;