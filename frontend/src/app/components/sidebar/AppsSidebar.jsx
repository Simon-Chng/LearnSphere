import React from 'react';
import '../../styles/sidebar.css';

const AppsSidebar = ({
  isOpen,
  categories,
  selectedCategory,
  onCategorySelect,
  onShowAllFeatures
}) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">Categories</span>
      </div>
      <div className="category-list">
        {categories.map(category => (
          <div
            key={category.id}
            className={`category-item ${category.id === selectedCategory ? 'active' : ''}`}
            onClick={() => onCategorySelect(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </div>
        ))}
      </div>
      <button className="all-features-button" onClick={onShowAllFeatures}>
        All Features
      </button>
    </div>
  );
};

export default AppsSidebar;
