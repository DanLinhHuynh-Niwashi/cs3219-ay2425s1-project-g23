import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Badge, Container, Row, Col } from 'react-bootstrap';
import './Login.css';

function Signup() {
  const [details, setDetails] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigate = useNavigate()
  const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000/api';
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(details)
    console.log('confirm password:' + confirmPassword)
    if (details.password != confirmPassword) {
      alert('Password do not match');
      return
    }
    const response = await fetch(`${baseUrl}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });
    const result = await response.json();
    if (!response.ok) {
      alert(`Error: ${result.message}`);
    } else {
      alert(`Successfully created new account. Please log in!`);
      navigate('/questions')
    }
  }
  return (
    <Container className="outer-container">
      <Container className="login-container">
        <Row className="justify-content-center">
          <Col xs={12} md={8} className="text-center">
            <h2 style={{ color: '#4A4A4A', fontWeight: 'bold', marginBottom: '30px' }}>PEERPREP</h2>
            <h3 style={{ color: '#4A4A4A', marginBottom: '40px' }}>Create Account</h3>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="username" style={{ marginBottom: '20px' }}>
                <Form.Control
                  placeholder="Username"
                  type="text"
                  required
                  style={{ height: '50px' }}
                  onChange={e => setDetails({ ...details, username: e.target.value })}
                />
              </Form.Group>
              <Form.Group controlId="email" style={{ marginBottom: '20px' }}>
                <Form.Control
                  placeholder="Email"
                  type="email"
                  required
                  style={{ height: '50px' }}
                  onChange={e => setDetails({ ...details, email: e.target.value })}
                />
              </Form.Group>
              <Form.Group style={{ marginBottom: '20px' }}>
                <Form.Control
                  placeholder="Password"
                  type="password"
                  required
                  style={{ height: '50px' }}
                  onChange={e => setDetails({ ...details, password: e.target.value })}
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
                NEXT
              </Button>
              <div className="mb-2 account-creation">
                Already have an account?
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

export default Signup