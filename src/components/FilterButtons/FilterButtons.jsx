import React from 'react';

const FilterButtons = ({ selectedFilter, onFilterChange, filters = ["All", "Pending", "Approved", "Declined"] }) => {
  return (
    <div className="filter-buttons">
      {filters.map((filter) => (
        <button
          key={filter}
          className={selectedFilter === filter ? "selected" : ""}
          onClick={() => onFilterChange(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons; 