import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Select from 'react-select'; 
import './AddQuestion.css';

const AddQuestion = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState({
    title: '',
    description: '',
    complexity: 'easy',
    categories: [], // Array for multiple categories
  });
  const [categoriesOptions, setCategoriesOptions] = useState([]); // Options for the categories dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define API base URL using environment variables
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    let isMounted = true; // track if component is mounted

    // Fetch categories details
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/categories`);
        if (!categoriesResponse.ok) {
          throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
        }
        const categoriesData = await categoriesResponse.json();
        const options = categoriesData.data.map(category => ({
          value: category.id,
          label: category.name,
        }));

        if (isMounted) {
          setCategoriesOptions(options);
        }

        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (isMounted) setError(error.message); // Set error message
        if (isMounted) setLoading(false); // Set loading to false in case of error
      }
    };

    fetchCategories();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [API_BASE_URL]);

  const handleChange = (e) => {
    setQuestion({ ...question, [e.target.name]: e.target.value });
  };

  const handleCategoriesChange = (selectedOptions) => {
    setQuestion({
      ...question,
      categories: selectedOptions || [], // Store the selected options
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const newQuestion = {
        ...question,
        categories: question.categories.map(option => option.value), // Extract only values from selected options
      };

      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST', // Use POST for creating a new question
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      });

      if (!response.ok) {
        throw new Error(`Error creating question: ${response.statusText}`);
      }

      navigate('/questions', { replace: true }); // Navigate back to the questions list after saving
    } catch (error) {
      console.error('Error creating question:', error);
      setError(error.message);
    }
  };

  const handleCancel = () => {
    navigate('/questions', { replace: true }); // Navigate back to the questions list without saving
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading message while fetching
  }

  if (error) {
    return <div>{error}</div>; // Display error message if there was an error
  }

  return (
    <Container className="add-question-page" style={{ marginTop: '20px' }}>
      <Row>
        <Col>
          <h2>Add New Question</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTitle" className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={question.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={5}
                value={question.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formComplexity" className="mb-3">
              <Form.Label>Difficulty</Form.Label>
              <Form.Control
                as="select"
                name="complexity"
                value={question.complexity}
                onChange={handleChange}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formCategories" className="mb-3">
              <Form.Label>Categories</Form.Label>
              <Select
                isMulti // Allow multiple selection
                name="categories"
                options={categoriesOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                value={question.categories}
                onChange={handleCategoriesChange}
                placeholder="Select categories..."
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="me-2">
              Save Question
            </Button>
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AddQuestion;
