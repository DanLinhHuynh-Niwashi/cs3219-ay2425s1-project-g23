import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal, Button, Form, Badge, Container, Row, Col } from 'react-bootstrap';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleShowForgetPassword = () => setShowModal(true);
  const handleCloseForgetPassword = () => {
    setResetSuccess(false)
    setShowModal(false);
  }
  const [login, setLogin] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate()
  const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000/api';
  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(login);
    try {
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
    } catch (err) {
      console.log(err);
      alert(`Error connecting to the server. Please try again later.`);
    }
  }

  const handlePasswordReset = async(e) => {
    setSendingEmail(true)
    e.preventDefault();
    try {
      const response = await fetch(`${baseUrl}/users/reset-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), 
      });
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        setResetSuccess(true);
      } else {
        alert("Failed to send email to reset password");
      }
    } catch (error) {
      alert("Failed to send email to reset password");
    }
    setSendingEmail(false)
  };
  return (
    <div>
      <Modal show={showModal} onHide={handleCloseForgetPassword} centered>
        <Modal.Header style={{ justifyContent: 'center' }} className="mb-2">
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!resetSuccess ? (
            <Form onSubmit={handlePasswordReset}>
              <Form.Group className="mb-4">
                <Form.Control 
                type="email" 
                placeholder="Enter your email" 
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)}/>
              </Form.Group>
              <div className="d-flex justify-content-center">
                <Button type="submit" className="mb-2" disabled={sendingEmail}>
                  Send Reset Link
                </Button>
              </div>
            </Form>
          ) : (<div className="text-center">
            <p>Password reset link has been sent to your email!</p>
          </div>)}

        </Modal.Body>
      </Modal>
      <Container className="outer-container">
        <Container className="login-container">
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <h2 style={{ color: '#4A4A4A', fontWeight: 'bold', marginBottom: '30px' }}>PEERPREP</h2>
              <h3 style={{ color: '#4A4A4A', marginBottom: '40px' }}>Welcome Back!</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email" style={{ marginBottom: '30px' }}>
                  <Form.Control
                    placeholder="Email"
                    type="email"
                    required
                    style={{ height: '50px' }}
                    onChange={e => setLogin({ ...login, email: e.target.value })}
                  />
                </Form.Group>
                <Form.Group style={{ marginBottom: '6px' }}>
                  <Form.Control
                    placeholder="Password"
                    type="password"
                    required
                    style={{ height: '50px' }}
                    onChange={e => setLogin({ ...login, password: e.target.value })}
                  />
                </Form.Group>
                <div style={{ textAlign: "left", marginBottom: "30px", marginLeft: "8px" }}>
                  <span
                    style={{
                      color: "#A9A9A9",
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontSize: "12px",
                    }}
                    onClick={handleShowForgetPassword}
                  >
                    Forgot Password?
                  </span>
                </div>
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
      </Container>
    </div>

  )
}

export default Login