import React from 'react';
import '../../styles/chat.css';

const ThinkingIndicator = () => {
  return (
    <div className="message assistant thinking">
      <div className="thinking-dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
