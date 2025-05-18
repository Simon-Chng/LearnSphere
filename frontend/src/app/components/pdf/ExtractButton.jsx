import React from 'react';

/**
 * Floating button displayed near selected text in a PDF viewer.
 *
 * - Positioned absolutely using `position` prop (coordinates).
 * - Calls `onClick` handler when clicked to initiate text extraction.
 *
 * @component
 * @param {Object} props
 * @param {{ x: number, y: number }} props.position - The x/y coordinates for positioning the button
 * @param {() => void} props.onClick - Callback fired when the button is clicked
 * @returns {JSX.Element}
 */
const ExtractButton = ({ position, onClick }) => {
  return (
    <div 
      className="extract-button-container"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)'
      }}
    >
      <button 
        type="button"
        onClick={onClick}
        className="extract-button"
      >
        Extract Text
      </button>
    </div>
  );
};

export default ExtractButton;
