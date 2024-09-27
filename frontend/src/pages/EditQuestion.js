import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import Select from 'react-select'; // Import react-select for multi-select dropdown
import './EditQuestion.css';

const EditQuestion = () => {
  const { id } = useParams(); // Get the question ID from the URL
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
    let isMounted = true; // Track if component is mounted

    // Fetch question details and categories from API
    const fetchQuestionAndCategories = async () => {
      try {
        // Fetch question details
        const questionResponse = await fetch(`${API_BASE_URL}/api/questions/${id}`);
        if (!questionResponse.ok) {
          throw new Error(`Error fetching question: ${questionResponse.statusText}`);
        }
        const questionData = await questionResponse.json();
        if (isMounted) {
          setQuestion({
            ...questionData.data,
            categories: questionData.data.categories.map(catId => ({
              value: catId,
              label: `Category ${catId}`, // Placeholder label until categories are fetched
            })),
          });
        }

        // Fetch categories details
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

          // Map the question categories to the fetched categories
          const mappedCategories = questionData.data.categories.map(catId => {
            const category = options.find(option => option.value === catId);
            return category || { value: catId, label: `Category ${catId}` }; // Fallback for unknown category
          });

          setQuestion(prevQuestion => ({
            ...prevQuestion,
            categories: mappedCategories,
          }));
        }

        setLoading(false); // Set loading to false when data is fetched
      } catch (error) {
        console.error('Error fetching question or categories:', error);
        if (isMounted) setError(error.message); // Set error message
        if (isMounted) setLoading(false); // Set loading to false in case of error
      }
    };

    fetchQuestionAndCategories();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, [id, API_BASE_URL]);

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
      const updatedQuestion = {
        title: question.title,
        description: question.description,
        complexity: question.complexity,
        categories: question.categories.map(option => option.value), // Extract only values from selected options
      };

      const response = await fetch(`${API_BASE_URL}/api/questions/${id}`, {
        method: 'PATCH', // Use PATCH instead of PUT
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestion),
      });

      if (!response.ok) {
        throw new Error(`Error updating question: ${response.statusText}`);
      }

      navigate(`/questions/${id}`, { replace: true }); // Navigate back to the question details page after saving
    } catch (error) {
      console.error('Error updating question:', error);
      setError(error.message);
    }
  };

  const handleCancel = () => {
    navigate(`/questions/${id}`, { replace: true }); // Navigate back to the question details page without saving
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading message while fetching
  }

  if (error) {
    return <div>{error}</div>; // Display error message if there was an error
  }

  return (
    <Container className="edit-question-page" style={{ marginTop: '20px' }}>
      <Row>
        <Col>
          <h2>Edit Question</h2>
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
              Save Changes
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

export default EditQuestion;
