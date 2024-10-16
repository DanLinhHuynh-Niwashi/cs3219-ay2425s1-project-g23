// src/components/SearchBar.js
import React from 'react';
import { FormControl } from 'react-bootstrap';
import './SearchBar.css';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-bar">
      <FormControl
        type="text"
        placeholder="Search questions..."
        value={value}
        onChange={onChange}
        className="search-input"
      />
    </div>
  );
};

export default SearchBar;
