import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import QuestionsList from '../components/QuestionsList';
import AdminPanel from '../components/AdminPanel';
import './Questions.css';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesDict, setCategoriesDict] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  // Set the base URL for API calls
  const baseUrl = process.env.REACT_APP_QUESTION_API_URL || 'http://localhost:3000';
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log(`Fetching questions from: ${baseUrl}/questions`);
        const response = await fetch(`${baseUrl}/questions`);
        console.log("Questions response:", response);

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Questions data:", data);
        setQuestions(data.data || []);
        setFilteredQuestions(data.data || []);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        console.log(`Fetching categories from: ${baseUrl}/categories`);
        const response = await fetch(`${baseUrl}/categories`);
        console.log("Categories response:", response);

        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Categories data:", data);

        // Create a dictionary for quick category name lookup by index
        const categoriesLookup = data.data.reduce((acc, category, index) => {
          acc[category.id] = category.name; // Use index + 1 as key to match question categories
          return acc;
        }, {});

        setCategories(data.data || []);
        setCategoriesDict(categoriesLookup); // Store in state
        setSelectedCategories(Object.keys(categoriesLookup)); // Select all categories by default
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchQuestions();
    fetchCategories();
  }, [baseUrl]);

  // Update filtered questions whenever search term or selected categories change
  useEffect(() => {
    console.log("Filtering questions...");
    filterQuestions();
  }, [searchTerm, selectedCategories, questions]);

  const filterQuestions = () => {
    console.log("Questions to filter:", questions);
    console.log("Selected categories:", selectedCategories);
  
    const filtered = questions.filter((q) => {
      // Map category IDs to names using the categoriesDict
      const questionCategoryNames = q.categories.map(categoryId => categoriesDict[categoryId]);
  
      // Check if any of the question's category names are in the selected categories
      const matchesCategory = selectedCategories.some((categoryName) => 
        questionCategoryNames.includes(categoryName)
      );
  
      // Filter by both category match and search term
      return matchesCategory && q.title.toLowerCase().includes(searchTerm.toLowerCase());
    });
  
    console.log("Filtered questions:", filtered);
    setFilteredQuestions(filtered);
  };

  const handleFilterChange = (selectedCategoryNames) => {
    console.log("Category filter changed:", selectedCategoryNames);
    setSelectedCategories(selectedCategoryNames);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddQuestion = () => {
    navigate('/add-question'); // Navigate to Add Question page
  };

  return (
    <div className="questions-page">
      <Row className="search-bar-row">
        <Col>
          <SearchBar value={searchTerm} onChange={handleSearchChange} /> {/* Pass the search term and change handler */}
        </Col>
      </Row>
      <Row className="admin-panel-row">
        <Col>
          <AdminPanel
            addQuestion="/questions/new" // Route to navigate when Add Question button is clicked
          />
        </Col>
      </Row>
      <Row className="content-row">
        <Col xs={9} className="questions-list-col">
          {filteredQuestions.length > 0 ? (
            <QuestionsList
              questions={filteredQuestions}
              categoriesDict={categoriesDict} // Pass category dictionary for lookup
            />
          ) : (
            <p>No questions available</p>
          )}
        </Col>
        <Col xs={3} className="filter-panel-col">
          <FilterPanel categories={categories} onFilterChange={handleFilterChange} />
        </Col>
      </Row>
    </div>
  );
};

export default Questions;
