import React from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = ({ placeholder, onSearch }) => {
  const handleChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default SearchBar;
