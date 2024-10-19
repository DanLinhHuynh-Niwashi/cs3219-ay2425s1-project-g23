// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = ({ addQuestion, editQuestion, deleteQuestion }) => {
  const baseUrl = process.env.REACT_APP_USER_API_URL || 'http://localhost:3000';
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const cookie = document.cookie.split(';');
        const cookiesObject = cookie.reduce((acc, curr) => {
          const [key, value] = curr.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        const token = cookiesObject['token'] || '';
        const id = cookiesObject['user_id'] || '';
        if (token.length == 0 || id.length == 0) {
          throw new Error(`Did not retreive cookies invalid authentication`)
        }
        const response = await fetch(`${baseUrl}/users/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          if (data['data']['isAdmin']) {
            setIsAdmin(true);
          }
        } else {
          alert(data.message)
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    checkAdmin();
  }, [baseUrl]);
  return (
  isAdmin && <Container className="admin-panel">
    <Row className="align-items-center">
      <Col className="admin-panel-label">
        <strong>Admin Panel</strong>
      </Col>
      <Col className="text-end">
        {addQuestion && (
          <Button
            variant="primary"
            className="me-2"
            onClick={() => navigate(addQuestion)}
          >
            Add Question
          </Button>
        )}
        {editQuestion && (
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => navigate(editQuestion)}
          >
            Edit Question
          </Button>
        )}
        {deleteQuestion && (
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this question?')) {
                deleteQuestion();
              }
            }}
          >
            Delete Question
          </Button>
        )}
      </Col>
    </Row>
  </Container>)
};

export default AdminPanel;
