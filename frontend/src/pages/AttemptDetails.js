import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AttemptDetails.css';

const AttemptDetails = () => {
  const { id } = useParams(); // Get the attempt ID from the URL
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = process.env.REACT_APP_ATTEMPT_API_URL || 'http://localhost:8082';

  useEffect(() => {
    // Fetch attempt details by ID
    const fetchAttempt = async () => {
      try {
        const response = await fetch(`${baseUrl}/history/attempts/${id}`); // Adjust endpoint if needed
        if (!response.ok) {
          throw new Error('Failed to fetch attempt details');
        }
        const data = await response.json();
        setAttempt(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [id, baseUrl]);

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

  // Display the attempt details if loaded
  return (
    <div className="attempt-details">
      <h2>{attempt.title}</h2>
      <p><strong>Date & Time Attempted:</strong> {formattedDate}</p>
      <p><strong>Duration:</strong> {attempt.duration} mins</p>
      <p><strong>Description:</strong> {attempt.description}</p>
      <p><strong>Complexity:</strong> {attempt.complexity}</p>
      <p><strong>Categories:</strong> {attempt.categories.join(', ')}</p>
      <div className="attempt-content">
        <p><strong>Code:</strong> {attempt.attemptCode}</p>
      </div>
    </div>
  );
};

export default AttemptDetails;