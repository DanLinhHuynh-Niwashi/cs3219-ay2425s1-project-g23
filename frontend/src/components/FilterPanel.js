// src/components/FilterPanel.js
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import './FilterPanel.css';

const FilterPanel = ({ categories, onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const initialSelectedCategories = categories.map((category) => category.name); // Select all categories by name
    setSelectedCategories(initialSelectedCategories);
    onFilterChange(initialSelectedCategories); // Trigger initial filter
  }, [categories]); // Removed onFilterChange from dependency array

  const handleCheckboxChange = (categoryName, isChecked) => {
    let updatedCategories = [...selectedCategories];
    if (isChecked) {
      updatedCategories.push(categoryName);
    } else {
      updatedCategories = updatedCategories.filter((name) => name !== categoryName);
    }
    setSelectedCategories(updatedCategories);
    onFilterChange(updatedCategories); // Call onFilterChange only when the selected categories are updated
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
            onChange={(e) => handleCheckboxChange(category.name, e.target.checked)}
          />
        ))}
      </Form>
    </div>
  );
};

export default FilterPanel;
