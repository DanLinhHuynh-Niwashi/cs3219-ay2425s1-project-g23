// src/components/AdminPanel.js
import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';


const AdminPanel = ({ addQuestion, editQuestion, deleteQuestion }) => {
  const navigate = useNavigate();

  return (
    <Container className="admin-panel">
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
    </Container>
  );
};

export default AdminPanel;
