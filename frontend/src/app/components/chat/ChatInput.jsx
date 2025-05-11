import React from 'react';
import '../../styles/chat.css';

const ChatInput = ({ value, onChange, onSubmit, disabled }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled && value.trim()) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value);
    }
  };

  return (
    <div className="input-container">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question..."
        className="input-box"
        rows="3"
        disabled={disabled}
      />
      <button 
        onClick={handleSubmit} 
        className="button ask-ai"
        disabled={disabled || !value.trim()}
      >
        {disabled ? 'Thinking...' : 'Send'}
      </button>
    </div>
  );
};

export default ChatInput;
