import React, { useState } from 'react';
import '../../styles/modal.css';

/**
 * NewChatModal renders a two-step modal that lets the user select a category and then a model to create a new chat.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {Function} props.onClose - Function to call when the modal is closed or cancelled.
 * @param {Array<{ name: string, model_type: string }>} props.availableModels - Array of model objects with name and type.
 * @param {string} props.selectedModel - The initially selected model.
 * @param {Array<{ id: string|number, name: string, icon: string }>} props.categories - List of chat categories.
 * @param {string|number} props.selectedCategory - The initially selected category.
 * @param {Function} props.onSelect - Function to call when the user finishes selection.
 *   Receives arguments: `(selectedModel: string, selectedCategory: string|number, confirmed: boolean)`.
 * @returns {JSX.Element|null} The modal element if `isOpen` is true, otherwise null.
 */
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

  // Group models by type
  const modelsByType = availableModels.reduce((acc, model) => {
    // Get model type - fallback to 'ollama' if not specified
    const modelType = model.model_type || 'ollama';
    
    if (!acc[modelType]) {
      acc[modelType] = [];
    }
    
    acc[modelType].push(model.name || model);
    return acc;
  }, {});

  // Get model type display name
  const getModelTypeDisplay = (type) => {
    switch(type) {
      case 'ollama': return 'Local (Ollama)';
      case 'groq': return 'Cloud (Groq)';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
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
              {Object.entries(modelsByType).map(([type, models]) => (
                <div key={type} className="model-group">
                  <h3 className="model-type-header">{getModelTypeDisplay(type)}</h3>
                  {models.map((modelName) => (
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
