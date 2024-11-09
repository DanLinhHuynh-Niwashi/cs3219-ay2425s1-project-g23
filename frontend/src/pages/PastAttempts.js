import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import AttemptsList from '../components/PastAttemptsList'; 
import './PastAttempts.css';

const PastAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesDict, setCategoriesDict] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  const baseUrl = process.env.REACT_APP_ATTEMPT_API_URL || 'http://localhost:8082';
  const categoryUrl = process.env.REACT_APP_QUESTION_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        // Parse cookies to retrieve user ID and token
        const cookie = document.cookie.split(';');
        const cookiesObject = cookie.reduce((acc, curr) => {
          const [key, value] = curr.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});

        const token = cookiesObject['token'] || '';
        const userId = cookiesObject['user_id'] || '';

        // Log the parsed token and userId
        console.log('Parsed token:', token);
        console.log('Parsed userId:', userId);

        // Validate that token and userId are present
        if (token.length === 0 || userId.length === 0) {
          console.error('Invalid authentication: Missing token or user ID');
          return;
        }

        // Fetch the past attempts for the specific user
        const response = await fetch(`${baseUrl}/history/user/${userId}`);

        // Process the response
        const data = await response.json();
        console.log('API response:', data);  // Log full response from API

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch past attempts');
        }

        // Set attempts and log the state update
        setAttempts(data.data || []);
        setFilteredAttempts(data.data || []);
        console.log('Attempts data set:', data.data || []);
      } catch (error) {
        console.error('Error fetching attempts:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        console.log(`Fetching categories from: ${categoryUrl}/categories`);
        const response = await fetch(`${categoryUrl}/categories`);
        console.log("Categories response:", response);

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Categories data:", data);

        // Create a dictionary for quick category name lookup by index
        const categoriesLookup = data.data.reduce((acc, category, index) => {
          acc[category.name] = category.name; // Use index + 1 as key to match question categories
          return acc;
        }, {});

        setCategories(data.data || []);
        setCategoriesDict(categoriesLookup); // Store in state
        setSelectedCategories(Object.keys(categoriesLookup)); // Select all categories by default
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchAttempts();
    fetchCategories();
  }, [baseUrl, categoryUrl]);

  // Update filtered questions whenever search term or selected categories change
  useEffect(() => {
    console.log("Filtering attempts...");
    filterAttempts();
  }, [searchTerm, selectedCategories, attempts]);

  const filterAttempts = () => {
    console.log("Attempts to filter:", attempts);
    console.log("Selected categories:", selectedCategories);
  
    const filtered = attempts.filter((attempt) => {
      // Map category IDs to names using the categoriesDict
      const attemptCategoryNames = attempt.categories
      console.log('Attempt categories:', attempt.categories);
  
      // Check if any of the question's category names are in the selected categories
      const matchesCategory = selectedCategories.some((categoryName) => 
        attemptCategoryNames.includes(categoryName)
      );
  
      // Filter by both category match and search term
      return matchesCategory && attempt.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  
    console.log("Filtered attempts:", filtered);
    setFilteredAttempts(filtered);
  };

  const handleFilterChange = (selectedCategoryNames) => {
    setSelectedCategories(selectedCategoryNames);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="past-attempts-page">
      <Row className="search-bar-row">
        <Col>
          <SearchBar value={searchTerm} onChange={handleSearchChange} />
        </Col>
      </Row>
      <Row className="content-row">
        <Col xs={9} className="attempts-list-col">
          {filteredAttempts.length > 0 ? (
            <AttemptsList 
              attempts={filteredAttempts} 
              categoriesDict={categoriesDict}
            />
          ) : (
            <p>No past attempts available</p>
          )}
        </Col>
        <Col xs={3} className="filter-panel-col">
          <FilterPanel categories={categories} onFilterChange={handleFilterChange} />
        </Col>
      </Row>
    </div>
  );
};

export default PastAttempts;