import React from 'react';

const TextPanel = ({ 
  selectedText, 
  isCopied, 
  onCopy, 
  onClose 
}) => {
  return (
    <div className="selected-text-container">
      <div className="selected-text-header">
        <span>Selected Text</span>
        <button 
          type="button"
          onClick={onClose}
          className="close-button"
        >
          ✕
        </button>
      </div>
      <div className="selected-text-content">
        {selectedText}
      </div>
      <div className="button-container">
        <button 
          type="button"
          onClick={onCopy}
          className={`pdf-button copy-button ${isCopied ? 'copied' : ''}`}
          disabled={isCopied}
        >
          {isCopied ? 'Copied!' : 'Copy Text'}
        </button>
      </div>
    </div>
  );
};

export default TextPanel;
