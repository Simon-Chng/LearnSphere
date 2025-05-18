import React from 'react';
import '../../styles/chat.css';

/**
 * Input component for typing and submitting user chat messages.
 *
 * - Handles `Enter` key for submission (without `Shift`).
 * - Calls `onSubmit` with trimmed input value.
 * - Disables input and button when `disabled` is true.
 *
 * @component
 * @param {Object} props
 * @param {string} props.value - Current input text
 * @param {(newValue: string) => void} props.onChange - Callback to update input text
 * @param {(inputValue: string) => void} props.onSubmit - Callback when message is submitted
 * @param {boolean} props.disabled - Whether input and send button are disabled
 * @returns {JSX.Element}
 */
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
