import React from 'react';

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
