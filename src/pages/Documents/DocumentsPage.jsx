import React, { useState } from 'react';
import HeaderTabs from '../../components/HeaderTabs/HeaderTabs';
import './DocumentsPage.css';

const Documents = () => {
  const [selectedTab, setSelectedTab] = useState('Documents');
  const [selectedFilter, setSelectedFilter] = useState('All'); // State for selected filter button

  return (
    <div className="documents-container">
      <HeaderTabs
        tabOne="Notifications"
        tabTwo="Documents"
        tabThree="Account"
        handleTabChange={setSelectedTab}
      />

      {/* Buttons Section */}
      <div className="filter-buttons">
        {['All', 'Pending', 'Approved', 'Declined'].map((filter) => (
          <button
            key={filter}
            className={selectedFilter === filter ? 'selected' : ''}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {selectedTab === 'Notifications'}

        {selectedTab === 'Documents'}

        {selectedTab === 'Account'}
      </div>
    </div>
  );
};

export default Documents;
