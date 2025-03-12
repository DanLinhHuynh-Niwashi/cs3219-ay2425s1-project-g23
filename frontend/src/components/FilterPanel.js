// src/components/FilterPanel.js
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import './FilterPanel.css';

const FilterPanel = ({ categories, onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedComplexities, setSelectedComplexities] = useState([]);

  // Hard-coded complexity options
  const complexities = ["Easy", "Medium", "Hard"];

  useEffect(() => {
    const initialSelectedCategories = categories.map((category) => category.name); // Select all categories by name
    setSelectedCategories(initialSelectedCategories);
    setSelectedComplexities(complexities);
    onFilterChange(initialSelectedCategories, selectedComplexities); // Trigger initial filter
  }, [categories]); // Removed onFilterChange from dependency array

  useEffect(() => {
    onFilterChange(selectedCategories, selectedComplexities); // Trigger filter when categories or complexities change
  }, [selectedCategories, selectedComplexities]); // Depend on both selectedCategories and selectedComplexities

  const handleCategoryChange = (categoryName, isChecked) => {
    let updatedCategories = [...selectedCategories];
    if (isChecked) {
      updatedCategories.push(categoryName);
    } else {
      updatedCategories = updatedCategories.filter((name) => name !== categoryName);
    }
    setSelectedCategories(updatedCategories);
  };

  const handleComplexityChange = (complexity, isChecked) => {
    let updatedComplexities = [...selectedComplexities];
    if (isChecked) {
      updatedComplexities.push(complexity);
    } else {
      updatedComplexities = updatedComplexities.filter((name) => name !== complexity);
    }
    setSelectedComplexities(updatedComplexities);
  };

  

  return (
    <div className="filter-panel">
      <h5>Filter by Category</h5>
      <Form>
        {categories.map((category, index) => (
          <Form.Check
            key={index} // Use index as a fallback key since id is null
            type="checkbox"
            label={category.name}
            value={category.name}
            checked={selectedCategories.includes(category.name)}
            onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
          />
        ))}
      </Form>

      <h5>Filter by Complexity</h5>
      <Form>
        {complexities.map((complexity, index) => (
          <Form.Check
            key={index}
            type="checkbox"
            label={complexity}
            value={complexity}
            checked={selectedComplexities.includes(complexity)}
            onChange={(e) => handleComplexityChange(complexity, e.target.checked)}
          />
        ))}
      </Form>
    </div>
  );
};

export default FilterPanel;
