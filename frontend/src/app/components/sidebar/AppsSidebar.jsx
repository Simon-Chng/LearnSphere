import React from 'react';
import '../../styles/sidebar.css';

/**
 * Sidebar component for navigating app feature categories.
 *
 * - Displays a list of selectable categories.
 * - Highlights the currently selected category.
 * - Includes a button to reset to "All Features".
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the sidebar is visible
 * @param {Array<{ id: string, name: string, icon: string }>} props.categories - List of feature categories
 * @param {string} props.selectedCategory - Currently selected category ID
 * @param {(categoryId: string) => void} props.onCategorySelect - Handler when a category is clicked
 * @param {() => void} props.onShowAllFeatures - Handler to reset view to show all features
 * @returns {JSX.Element}
 */
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
