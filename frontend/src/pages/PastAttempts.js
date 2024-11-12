import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import AttemptsList from '../components/PastAttemptsList'; 
import './PastAttempts.css';
import { fetchAttemptsById } from '../models/historyModel';
import { fetchCategories } from '../models/questionModel';

const PastAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [filteredAttempts, setFilteredAttempts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTokens, setSearchTokens] = useState(['']);
  const [categories, setCategories] = useState([]);
  const [categoriesDict, setCategoriesDict] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedComplexities, setSelectedComplexities] = useState([]);

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

        // Validate that token and userId are present
        if (token.length === 0 || userId.length === 0) {
          console.error('Invalid authentication: Missing token or user ID');
          return;
        }

        // Fetch the past attempts for the specific user
        const response = await fetchAttemptsById(userId);

        const data = await response.json();
        console.log('API response:', data);  // Log full response from API

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch past attempts');
        }

        setAttempts(data.data || []);
        setFilteredAttempts(data.data || []);
        console.log('Attempts data set:', data.data || []);
      } catch (error) {
        console.error('Error fetching attempts:', error);
      }
    };

    const getCategories = async () => {
      try {
        const response = await fetchCategories();
        console.log("Categories response:", response);

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Categories data:", data);

        // Create a dictionary for quick category name lookup by index
        const categoriesLookup = data.data.reduce((acc, category) => {
          acc[category.name] = category.name; 
          return acc;
        }, {});

        setCategories(data.data || []);
        setCategoriesDict(categoriesLookup); // Store in state
        setSelectedCategories(Object.keys(categoriesLookup)); // Select all categories by default
        setSelectedComplexities(['Easy', 'Medium', 'Hard']);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchAttempts();
    getCategories();
  }, []);

  // Update filtered attempts whenever search term or selected categories change
  useEffect(() => {
    console.log("Filtering attempts...");
    filterAttempts();
  }, [searchTerm, searchTokens, selectedCategories, selectedComplexities, attempts]);

  const filterAttempts = () => {
    console.log("Attempts to filter:", attempts);
    console.log("Selected categories:", selectedCategories);
    console.log("Selected complexities:", selectedComplexities);

    console.log(searchTokens)
    if (searchTokens.length == 0) {
      setSearchTokens(['']);
    }

    const filtered = attempts.filter((attempt) => {
      const attemptCategoryNames = attempt.categories
  
      // Check if any of the attempts's category names are in the selected categories
      const matchesCategory = selectedCategories.some((categoryName) => 
        attemptCategoryNames.includes(categoryName)
      );

      // Check if any of the attempts's complexity are in the selected complexities
      const matchesComplexity = selectedComplexities.some((complexity) => 
        attempt.complexity.toLowerCase() == complexity.toLowerCase()
      );

      // Combine title and description for full-text search
      const content = `${attempt.title.toLowerCase()} ${attempt.description.toLowerCase()}`;
  
      // Check if all search tokens are found in either title or description
      const matchesSearch = searchTokens.some(token => content.includes(token));
  
      // Filter by category match, compelxity match and search term
      return matchesCategory && matchesSearch && matchesComplexity;
    });
  
    console.log("Filtered attempts:", filtered);
    setFilteredAttempts(filtered);
  };

  const handleFilterChange = (selectedCategoryNames, selectedComplexityNames) => {
    console.log("Category filter changed:", selectedCategoryNames);
    console.log("Complexity filter changed:", selectedComplexityNames);
    setSelectedCategories(selectedCategoryNames);
    setSelectedComplexities(selectedComplexityNames);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Tokenize the search term into words
    setSearchTokens(e.target.value.toLowerCase().split(/\s+/).filter(token => token.trim() !== '')); // Split by whitespace
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
              searchTokens={searchTokens}
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