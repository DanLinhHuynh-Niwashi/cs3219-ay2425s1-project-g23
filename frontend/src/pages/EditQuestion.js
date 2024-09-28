import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Select from 'react-select';
import './EditQuestion.css';

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`${baseUrl}/questions/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error
          (`Failed to fetch question: ${response.status} ${response.statusText} - ${data.message}`);
        }
        
        setQuestion(data.data);
        setTitle(data.data.title);
        setDescription(data.data.description);
        setComplexity(data.data.complexity);
        setSelectedCategories(data.data.categories); // Set existing categories
      } catch (error) {
        console.error('Error fetching question:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${baseUrl}/categories`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error
          (`Failed to fetch categories: ${response.status} ${response.statusText} - ${data.message}`);
        }
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);
      }
    };

    fetchQuestion();
    fetchCategories();
  }, [id, baseUrl]);

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions.map((option) => option.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCategories.length === 0) {
      setError('Please select at least one category.');
      return;
    }

    // Map selected category names to category IDs for submission
    const selectedCategoryIds = selectedCategories.map((name) => {
      const category = categories.find((cat) => cat.name === name);
      return category ? category.id : null;
    }).filter((id) => id); // Filter out null/undefined IDs

    const updatedQuestion = {
      title,
      description,
      complexity,
      categories: selectedCategoryIds, // Use category IDs for submission
    };

    try {
      const response = await fetch(`${baseUrl}/questions/${id}`, {
        method: 'PATCH', // Use PATCH method
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuestion),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error
        (`Error updating question: ${response.status} ${response.statusText} - ${result.message}`);
      }
      alert(result.message);
      navigate(-1); // Go back to the previous page after updating
      
    } catch (error) {
      console.error('Error updating question:', error); // Updated error message
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }


  return (
    <Container className="edit-question-page">
      <Row>
        <Col>
          <h2>Edit Question</h2>
          {error && <Alert variant="danger">{error}</Alert>} {/* Display error message */}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="description" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="complexity" className="mt-3">
              <Form.Label>Complexity</Form.Label>
              <Form.Control
                as="select"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="categories" className="mt-3">
              <Form.Label>Categories</Form.Label>
              <Select
                isMulti
                options={categories.map((category) => ({
                  value: category.name,
                  label: category.name,
                }))}
                value={selectedCategories.map((name) => ({
                  value: name,
                  label: name,
                }))}
                onChange={handleCategoryChange}
                placeholder="Select categories..."
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Save Changes
            </Button>
            <Button
              variant="secondary"
              className="mt-3 ms-2"
              onClick={() => navigate(-1)} // Navigate back to the previous page
            >
              Cancel
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default EditQuestion;
