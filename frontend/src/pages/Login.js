import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Badge, Container, Row, Col } from 'react-bootstrap';
import './Login.css';

//TODO CANT GET IT TO CENTRALISE VERTICALLY!!!
//TODO on click button
function Login() {
  const [login, setLogin] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate()
  const baseUrl = process.env.REACT_APP_USER_API_URL || 'http://localhost:3002';
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(login);
    const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
        credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) {
      alert(`Login credentials incorrect`);
    } else {
      navigate('/questions')
    }
  }
  return (
    <Container className="login-container">
    <Row className="justify-content-center">
      <Col md={8} className="text-center">
        <h2 style={{ color: '#4A4A4A', fontWeight: 'bold', marginBottom: '30px'}}>PEERPREP</h2>
        <h3 style={{ color: '#4A4A4A',  marginBottom: '40px'}}>Welcome Back!</h3>
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="email" style={{ marginBottom: '30px' }}>
              <Form.Control
                placeholder="Email"
                type="email"
                required
                style={{ height: '50px' }}
                onChange={e => setLogin({...login, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group style={{ marginBottom: '40px' }}>
              <Form.Control
                placeholder="Password"
                type="password"
                required
                style={{ height: '50px' }}
                onChange={e => setLogin({...login, password: e.target.value})}
              />
            </Form.Group>
            <Button type="submit" className="mt-3 mb-4 custom-button">
              LOGIN
            </Button>
            <div className="mb-2">
              <a href="/signup" className="account-creation">
                Create account
              </a>            
            </div>
          </Form>
      </Col>
    </Row>
  </Container>
  )
}

export default Login