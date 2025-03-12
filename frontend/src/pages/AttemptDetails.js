import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Container, Row, Col } from 'react-bootstrap';
import MonacoEditor from '@monaco-editor/react';
import { fetchCategories } from '../models/questionModel';
import './AttemptDetails.css';
import { fetchAttemptDetails } from '../models/historyModel';

const AttemptDetails = () => {
  const { id } = useParams(); // Get the attempt ID from the URL
  const navigate = useNavigate(); // Use for navigating to edit page
  const [categoriesDict, setCategoriesDict] = useState({}); // Dictionary for category name lookup
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttemptAndCategories = async () => {
      try {
        const attemptResponse = await fetchAttemptDetails(id);
        if (!attemptResponse.ok) throw new Error('Failed to fetch attempt details');
        
        const attemptData = await attemptResponse.json();
        setAttempt(attemptData.data);

        const categoriesResponse = await fetchCategories();
        if (!categoriesResponse.ok) throw new Error(`Error fetching categories: ${categoriesResponse.statusText}`);
        
        const categoriesData = await categoriesResponse.json();

        const categoriesLookup = categoriesData.data.reduce((acc, category) => {
          acc[category.name] = category.name;
          return acc;
        }, {});

        setCategoriesDict(categoriesLookup);
        setLoading(false);

        console.log('Categories dictionary:', categoriesLookup);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptAndCategories();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Format the attempt date and time
  const formattedDate = new Date(attempt.attemptDateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use 12-hour time
  });
  const handleCopyCode = () => {
    navigator.clipboard.writeText(attempt.attemptCode).then(() => {
      alert("Code copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy code: ", err);
    });
  };
  // Display the attempt details if loaded
  return (
    <Container className="attempt-detail-page" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Row  style={{ height: '100%'}}>
        <Col>
          <Card
            className="mb-4"
            style={{
              borderColor: '#D6BCFA',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Card.Body>
              <Card.Title
                className="mb-4"
                style={{ color: '#4A4A4A', fontWeight: 'bold' }}
              >
                {attempt.title}
              </Card.Title>

              <Card.Text className="description" style={{ color: '#4A4A4A' }}>
                <strong>Description:</strong> <br />
                {attempt.description}
              </Card.Text>

              <Card.Text>
                <strong>Duration:</strong> <br />
                {attempt.duration} minutes
              </Card.Text>

              <Card.Text>
                <strong>Attempt Date:</strong> <br />
                {formattedDate}
              </Card.Text>
              <Card.Text>
                <strong>Difficulty:</strong> <br />
                <Badge
                  className="attempt-badge"
                  bg={attempt.complexity === 'Easy' ? 'success' : attempt.complexity === 'Medium' ? 'warning' : 'danger'}
                  style={{
                    color: '#fff',
                    fontSize: '14px',
                    padding: '5px',
                  }}
                >
                  {attempt.complexity}
                </Badge>
              </Card.Text>
              <Card.Text>
                <strong>Categories:</strong> <br />
                {attempt.categories.length > 0 ? (
                  attempt.categories.map((categoryName, index) => (
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
                      {categoriesDict[categoryName] || 'Unknown Category'} {/* Display category name */}
                    </Badge>
                  ))
                ) : (
                  <span>No categories assigned.</span>
                )}
              </Card.Text>
              
              <Button
                variant="primary"
                className="mt-3"
                onClick={() => navigate('/past-attempts')} // Go back to the attempts list
              >
                Back to Past Attempts
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', height: '100%' }}>
              <MonacoEditor
                height="100%"
                width="100%"
                theme="vs-dark"
                value={attempt.attemptCode}
                options={{
                readOnly: true,
                lineNumbers: 'on',
                minimap: { enabled: false },
                }}
              />
                
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyCode}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                  }}
                >
                  Copy Code
                </Button>
              </div>
        </Col>            
      </Row>
    </Container>
  );
};

export default AttemptDetails;
