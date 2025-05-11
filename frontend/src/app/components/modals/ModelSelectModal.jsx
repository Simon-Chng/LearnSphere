import React, { useState } from 'react';
import '../../styles/modal.css';

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
