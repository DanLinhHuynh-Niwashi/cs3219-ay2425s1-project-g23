import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import QuestionsList from '../components/QuestionsList';
import AdminPanel from '../components/AdminPanel';
import './Questions.css';
import { fetchCategories, fetchQuestions } from '../models/questionModel';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTokens, setSearchTokens] = useState(['']);
  const [categories, setCategories] = useState([]);
  const [categoriesDict, setCategoriesDict] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedComplexities, setSelectedComplexities] = useState([]);

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const response = await fetchQuestions();
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

    const getCategories = async () => {
      try {
        const response = await fetchCategories()
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
        setSelectedComplexities(['Easy', 'Medium', 'Hard']);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    getQuestions();
    getCategories();
  }, []);

  // Update filtered questions whenever search term or selected categories change
  useEffect(() => {
    console.log("Filtering questions...");
    filterQuestions();
  }, [searchTerm, searchTokens, selectedCategories, selectedComplexities, questions]);

  const filterQuestions = () => {
    console.log("Questions to filter:", questions);
    console.log("Selected categories:", selectedCategories);
    console.log("Selected complexities:", selectedComplexities);
    
    console.log(searchTokens)
    if (searchTokens.length == 0) {
      setSearchTokens(['']);
    }
    const filtered = questions.filter((q) => {
      // Map category IDs to names using the categoriesDict
      const questionCategoryNames = q.categories.map(categoryId => categoriesDict[categoryId]);
      
      // Check if any of the question's category names are in the selected categories
      const matchesCategory = selectedCategories.some((categoryName) => 
        questionCategoryNames.includes(categoryName)
      );
  
      // Check if any of the question's category names are in the selected categories
      const matchesComplexity = selectedComplexities.some((complexity) => 
        q.complexity.toLowerCase() == complexity.toLowerCase()
      );

      // Combine title and description for full-text search
      const content = `${q.title.toLowerCase()} ${q.description.toLowerCase()}`;
  
      // Check if all search tokens are found in either title or description
      const matchesSearch = searchTokens.some(token => content.includes(token));
  
      // Filter by both category match and search term
      return matchesCategory && matchesSearch && matchesComplexity;
    });
  
    console.log("Filtered questions:", filtered);
    setFilteredQuestions(filtered);
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
              searchTokens={searchTokens}
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
