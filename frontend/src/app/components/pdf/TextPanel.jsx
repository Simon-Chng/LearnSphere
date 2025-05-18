import React from 'react';

/**
 * A panel that displays selected text from a PDF and allows copying it to the clipboard.
 *
 * - Shows the extracted text.
 * - Provides a button to copy the text.
 * - Includes a close button to dismiss the panel.
 *
 * @component
 * @param {Object} props
 * @param {string} props.selectedText - The text selected by the user
 * @param {boolean} props.isCopied - Flag indicating if the text has been copied
 * @param {() => void} props.onCopy - Callback to copy the text to clipboard
 * @param {() => void} props.onClose - Callback to close the text panel
 * @returns {JSX.Element}
 */
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
