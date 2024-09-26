// src/pages/Questions.js
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import QuestionsList from '../components/QuestionsList';
import AdminPanel from '../components/AdminPanel'; // Import AdminPanel
import './Questions.css';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesDict, setCategoriesDict] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/questions');
        const data = await response.json();
        setQuestions(data.data);
        setFilteredQuestions(data.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/categories');
        const data = await response.json();
        setCategories(data.data);
        const categoriesLookup = data.data.reduce((acc, category) => {
          acc[category.id] = category.name;
          return acc;
        }, {});
        setCategoriesDict(categoriesLookup);
        setSelectedCategories(data.data.map((category) => category.id.toString())); // Select all categories by default
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchQuestions();
    fetchCategories();
  }, []);

  // Update filtered questions whenever search term or selected categories change
  useEffect(() => {
    filterQuestions();
  }, [searchTerm, selectedCategories, questions]);

  const filterQuestions = () => {
    const filtered = questions.filter((q) =>
      selectedCategories.some((categoryId) => q.categories.includes(parseInt(categoryId))) &&
      q.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuestions(filtered);
  };

  const handleFilterChange = (selectedCategoryIds) => {
    setSelectedCategories(selectedCategoryIds);
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
              categoriesDict={categoriesDict}
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
