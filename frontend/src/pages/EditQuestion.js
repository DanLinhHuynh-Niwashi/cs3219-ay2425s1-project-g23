// src/pages/EditQuestion.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Badge, Container } from 'react-bootstrap';
import Select from 'react-select';
import './EditQuestion.css';

const EditQuestion = () => {
  const { id } = useParams(); // Get question ID from URL
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState('easy');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoriesDict, setCategoriesDict] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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
        setTitle(questionData.data.title);
        setDescription(questionData.data.description);
        setComplexity(questionData.data.complexity);
        setSelectedCategories(questionData.data.categories); // Set selected categories as IDs initially

        // Fetch categories details
        const categoriesResponse = await fetch(`${baseUrl}/categories`);
        if (!categoriesResponse.ok) {
          throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
        }
        const categoriesData = await categoriesResponse.json();

        // Create a dictionary for quick lookup of category names by ID
        const categoriesLookup = categoriesData.data.reduce((acc, category) => {
          acc[category.id] = category.name;
          return acc;
        }, {});
        setCategoriesDict(categoriesLookup); // Save dictionary for lookup

        // Prepare select options for categories
        const options = categoriesData.data.map((category) => ({
          value: category.id,
          label: category.name,
        }));
        setCategories(options); // Set the options for the dropdown

        setLoading(false);
      } catch (error) {
        console.error('Error fetching question or categories:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchQuestionAndCategories();
  }, [id, baseUrl]);

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions.map(option => option.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedQuestion = {
      title,
      description,
      complexity,
      categories: selectedCategories, // Convert selected categories to IDs
    };

    try {
      const response = await fetch(`${baseUrl}/questions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestion),
      });

      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      // Navigate back to the question details page after successful update
      navigate(`/questions/${id}`);
    } catch (error) {
      console.error('Error updating question:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container className="edit-question-page">
      <h2>Edit Question</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formQuestionTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formQuestionDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formQuestionComplexity">
          <Form.Label>Complexity</Form.Label>
          <Form.Control
            as="select"
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="formQuestionCategories">
          <Form.Label>Categories</Form.Label>
          <Select
            isMulti
            value={categories.filter(option => selectedCategories.includes(option.value))}
            options={categories.filter(option => !selectedCategories.includes(option.value))}
            onChange={handleCategoryChange}
            placeholder="Select categories..."
          />
          <div className="selected-categories mt-2">
            {selectedCategories.map((categoryId) => (
              <Badge key={categoryId} className="me-1 mb-1" style={{ backgroundColor: '#D6BCFA', color: '#fff' }}>
                {categoriesDict[categoryId]} {/* Display category name */}
              </Badge>
            ))}
          </div>
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Save Changes
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3 ms-2">
          Cancel
        </Button>
      </Form>
    </Container>
  );
};

export default EditQuestion;
