import React, { useState } from 'react';
import '../../styles/modal.css';

/**
 * ModelSelectModal renders a modal that allows users to select an AI model before starting a new chat.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Function to call when the modal is dismissed.
 * @param {Function} props.onSelect - Function called with the selected model when user clicks "Create".
 * @param {string[]} props.availableModels - Array of model names available for selection.
 * @param {string} props.selectedModel - The initially selected model when the modal is opened.
 * @returns {JSX.Element|null} The modal element if `isOpen` is true, otherwise null.
 */
const ModelSelectModal = ({ isOpen, onClose, onSelect, availableModels, selectedModel: initialModel }) => {
  const [localSelectedModel, setLocalSelectedModel] = useState(initialModel);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>New Chat</h2>
        <p>Please select a model to create a new chat:</p>
        <div className="model-list">
          {availableModels.map((model) => (
            <div
              key={model}
              className={`model-item ${model === localSelectedModel ? 'active' : ''}`}
              onClick={() => setLocalSelectedModel(model)}
            >
              <span className="model-name">{model}</span>
              {model === localSelectedModel && (
                <span className="model-check">&#x2713;</span>
              )}
            </div>
          ))}
        </div>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-button create" onClick={() => onSelect(localSelectedModel, true)}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelectModal;
