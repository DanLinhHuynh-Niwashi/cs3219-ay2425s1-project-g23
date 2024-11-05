// src/pages/Question.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Container, Row, Col } from 'react-bootstrap';
import AdminPanel from '../components/AdminPanel';
import './Question.css';

const Question = () => {
  const { id } = useParams(); // Get the question ID from the URL
  const navigate = useNavigate(); // Use for navigating to edit page
  const [question, setQuestion] = useState(null);
  const [categoriesDict, setCategoriesDict] = useState({}); // Dictionary for category name lookup
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState(null); // Add an error state

  // Set the base URL for API calls
  const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000/api';

  // Fetch question and categories details from API
  useEffect(() => {
    const fetchQuestionAndCategories = async () => {
      try {
        // Fetch question details
        const questionResponse = await fetch(`${baseUrl}/questions/${id}`);
        if (!questionResponse.ok) {
          throw new Error(`Error fetching question: ${questionResponse.statusText}`);
        }
        const questionData = await questionResponse.json();
        setQuestion(questionData.data);

        // Fetch categories details
        const categoriesResponse = await fetch(`${baseUrl}/categories`);
        if (!categoriesResponse.ok) {
          throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
        }
        const categoriesData = await categoriesResponse.json();

        // Create a dictionary for quick category name lookup by index
        const categoriesLookup = categoriesData.data.reduce((acc, category) => {
          acc[category.id] = category.name;
          return acc;
        }, {});
        
        setCategoriesDict(categoriesLookup); // Store in state
        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error('Error fetching question or categories:', error);
        setError(error.message); // Set error message
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchQuestionAndCategories();
  }, [id, baseUrl]); // Re-fetch data when the ID or baseUrl changes

  const deleteQuestion = async () => {
    try {
      const response = await fetch(`${baseUrl}/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error deleting question: ${response.statusText}`);
      }
      navigate('/questions', { replace: true }); // Navigate back to questions list after deletion
    } catch (error) {
      console.error('Error deleting question:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading message while fetching
  }

  if (error) {
    return <div>{error}</div>; // Display error message if there was an error
  }

  if (!question) {
    return <div>Question not found</div>; // Display this if the question is null or undefined
  }

  return (
    <Container className="question-detail-page" style={{ marginTop: '20px' }}>
      <Row>
        <Col>
          <AdminPanel
            editQuestion={`/questions/${id}/edit`}
            deleteQuestion={deleteQuestion}
          /> {/* Admin Panel for Edit and Delete */}
          <Card className="mb-4" style={{ borderColor: '#D6BCFA', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }}>
            <Card.Body>
              <Card.Title className="mb-4" style={{ color: '#4A4A4A', fontWeight: 'bold' }}>
                {question.title}
              </Card.Title>
              <Card.Text className="description" style={{ color: '#4A4A4A' }}>
                <strong>Description:</strong> <br />
                {question.description}
              </Card.Text>
              <Card.Text>
                <strong>Difficulty:</strong> <br />
                <Badge
                  className="question-badge"
                  bg={question.complexity === 'Easy' ? 'success' : question.complexity === 'Medium' ? 'warning' : 'danger'}
                  style={{
                    color: '#fff',
                    fontSize: '14px',
                    padding: '5px',
                  }}
                >
                  {question.complexity}
                </Badge>
              </Card.Text>
              <Card.Text>
                <strong>Categories:</strong> <br />
                {question.categories.length > 0 ? (
                  question.categories.map((categoryId, index) => (
                    <Badge
                      key={index}
                      className="me-1 mb-1"
                      style={{
                        backgroundColor: '#D6BCFA', // Customize the color as needed
                        color: '#fff',
                        fontSize: '14px',
                        padding: '5px',
                      }}
                    >
                      {categoriesDict[categoryId] || 'Unknown Category'} {/* Display the category name instead of ID */}
                    </Badge>
                  ))
                ) : (
                  <span>No categories assigned.</span>
                )}
              </Card.Text>
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => navigate('/questions')} // Go back to the questions list
              >
                Back to Questions List
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Question;
