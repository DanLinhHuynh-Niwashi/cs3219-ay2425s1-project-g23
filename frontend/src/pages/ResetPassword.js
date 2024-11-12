import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Badge, Container, Row, Col } from 'react-bootstrap';
import './Login.css';

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { token } = useParams();
  const navigate = useNavigate()
  const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000/api';
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password != confirmPassword) {
      alert('Password do not match');
      return
    }
    const response = await fetch(`${baseUrl}/users/update-password/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({password, token}),
    });
    const result = await response.json();
    if (!response.ok) {
      alert(`Error: ${result.message}`);
    } else {
      alert(`Successfully reset password`);
      navigate('/login')
    }
  }
  return (
    <Container className="outer-container">
      <Container className="login-container">
        <Row className="justify-content-center">
          <Col xs={12} md={8} className="text-center">
            <h2 style={{ color: '#4A4A4A', fontWeight: 'bold', marginBottom: '30px' }}>PEERPREP</h2>
            <h3 style={{ color: '#4A4A4A', marginBottom: '40px' }}>Reset Password</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group style={{ marginBottom: '20px' }}>
                <Form.Control
                  placeholder="Password"
                  type="password"
                  required
                  style={{ height: '50px' }}
                  onChange={e => setPassword(e.target.value )}
                />
              </Form.Group>
              <Form.Group style={{ marginBottom: '20px' }}>
                <Form.Control
                  placeholder="Confirm password"
                  type="password"
                  required
                  style={{ height: '50px' }}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </Form.Group>
              <Button type="submit" className="mt-3 mb-4 custom-button">
                RESET
              </Button>
              <div className="mb-2 account-creation">
                Remembered your password?
                <a href="/login" className="account-creation">
                  Login
                </a>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </Container>
  )
}

export default ResetPassword