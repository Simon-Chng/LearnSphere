import React, { useState } from 'react';
import '../../styles/modal.css';

const NewChatModal = ({
  isOpen,
  onClose,
  availableModels = [],
  selectedModel: initialModel,
  categories = [],
  selectedCategory: initialCategory,
  onSelect
}) => {
  const [selectedModelTemp, setSelectedModelTemp] = useState(initialModel);
  const [selectedCategoryTemp, setSelectedCategoryTemp] = useState(initialCategory);
  const [step, setStep] = useState('category'); // 'category' or 'model'

  if (!isOpen) return null;

  const handleNext = () => {
    setStep('model');
  };

  const handleBack = () => {
    setStep('category');
  };

  const handleCreate = () => {
    onSelect(selectedModelTemp, selectedCategoryTemp, true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>New Chat</h2>
        
        {step === 'category' ? (
          <>
            <p>Please select a category for your chat:</p>
            <div className="category-list">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`category-item ${category.id === selectedCategoryTemp ? 'active' : ''}`}
                  onClick={() => setSelectedCategoryTemp(category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </div>
              ))}
            </div>
            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={onClose}>
                Cancel
              </button>
              <button 
                className="modal-button create" 
                onClick={handleNext}
                disabled={!selectedCategoryTemp}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            <p>Please select a model for your chat:</p>
            <div className="model-list">
              {availableModels.map((modelName) => (
                <div
                  key={modelName}
                  className={`model-item ${modelName === selectedModelTemp ? 'active' : ''}`}
                  onClick={() => setSelectedModelTemp(modelName)}
                >
                  <span className="model-name">{modelName}</span>
                  {modelName === selectedModelTemp && (
                    <span className="model-check">&#x2713;</span>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={handleBack}>
                Back
              </button>
              <button 
                className="modal-button create" 
                onClick={handleCreate}
                disabled={!selectedModelTemp}
              >
                Create
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewChatModal;
