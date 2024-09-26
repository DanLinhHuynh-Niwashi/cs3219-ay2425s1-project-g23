// src/components/FilterPanel.js
import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import './FilterPanel.css';

const FilterPanel = ({ categories, onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    setSelectedCategories(categories.map((category) => category.id.toString())); // Select all categories by default
    onFilterChange(categories.map((category) => category.id.toString())); // Trigger initial filter
  }, [categories]);

  const handleCheckboxChange = (categoryId, isChecked) => {
    let updatedCategories = [...selectedCategories];
    if (isChecked) {
      updatedCategories.push(categoryId.toString());
    } else {
      updatedCategories = updatedCategories.filter((id) => id !== categoryId.toString());
    }
    setSelectedCategories(updatedCategories);
    onFilterChange(updatedCategories);
  };

  return (
    <div className="filter-panel">
      <h5>Filter by Category</h5>
      <Form>
        {categories.map((category) => (
          <Form.Check
            key={category.id}
            type="checkbox"
            label={category.name}
            value={category.id}
            checked={selectedCategories.includes(category.id.toString())}
            onChange={(e) => handleCheckboxChange(category.id, e.target.checked)}
          />
        ))}
      </Form>
    </div>
  );
};

export default FilterPanel;
