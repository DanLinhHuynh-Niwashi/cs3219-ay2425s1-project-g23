import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { fetchCategories, addQuestion, uploadQuestions, uploadQuestionsOverride } from '../models/questionModel.js'
import './AddQuestion.css';

const AddQuestion = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState('Easy'); // Default to 'Easy'
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false); // State for submit loading
  const [file, setFile] = useState(null); // State for uploaded JSON file
  const [overrideDuplicates, setOverrideDuplicates] = useState(false); // State for checkbox

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await fetchCategories();
        const data = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText} - ${data.message}`);
        }
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error.message);
      }
    };

    getCategories();
  }, []);

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions.map((option) => option.value));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('questionsFile', file);

    try {
      setSubmitting(true);
      let response = null;
      if (overrideDuplicates) {
        response = await uploadQuestionsOverride(formData);
      } else {
        response = await uploadQuestions(formData);
      }
      

      const result = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.status} ${response.statusText} - ${result.message}`);
      }

      alert(result.message); // Show success message
      setFile(null); // Reset file input
      setOverrideDuplicates(false); // Reset checkbox
    } catch (error) {
      console.error('Error uploading file:', error.message);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!title || !description || selectedCategories.length === 0) {
      setError('Please fill in all required fields and select at least one category.');
      setSubmitting(false);
      return;
    }

    const selectedCategoryIds = selectedCategories.map((name) => {
      const category = categories.find((cat) => cat.name === name);
      return category ? category.id : null;
    }).filter((id) => id);

    const newQuestion = {
      title,
      description,
      complexity,
      categories: selectedCategoryIds,
    };

    try {
      const response = await addQuestion(newQuestion);

      const result = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to add question: ${response.status} ${response.statusText} - ${result.message}`);
      }

      alert(result.message);
      setTitle('');
      setDescription('');
      setComplexity('Easy');
      setSelectedCategories([]);
    } catch (error) {
      console.error('Error adding question:', error.message);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="add-question-page">
      <Row>
        <Col>
          <h2>Add New Question</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </Form.Group>
            <Form.Group controlId="description" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </Form.Group>
            <Form.Group controlId="complexity" className="mt-3">
              <Form.Label>Complexity</Form.Label>
              <Form.Control
                as="select"
                value={complexity}
                onChange={(e) => setComplexity(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
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
                isDisabled={isSubmitting}
              />
            </Form.Group>
            <Button disabled={isSubmitting} variant="primary" type="submit" className="mt-3">
              Add Question
            </Button>
            <Button
              disabled={isSubmitting}
              variant="secondary"
              className="mt-3 ms-2"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </Form>

          <hr className="my-4" />

          <h3>Or Upload JSON File</h3>
          <Form.Group controlId="fileUpload" className="mt-3">
            <Form.Control type="file" onChange={handleFileChange} accept=".json" disabled={isSubmitting} />
          </Form.Group>

          <Form.Group controlId="overrideDuplicates" className="mt-3">
            <Form.Check
              type="checkbox"
              label="Override existing questions if duplicates found"
              checked={overrideDuplicates}
              onChange={(e) => setOverrideDuplicates(e.target.checked)}
              disabled={isSubmitting}
            />
          </Form.Group>

          <Button
            variant="primary"
            className="mt-3"
            onClick={handleFileUpload}
            disabled={isSubmitting || !file}
          >
            Upload JSON File
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default AddQuestion;
