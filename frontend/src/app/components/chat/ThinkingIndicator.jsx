import React from 'react';
import '../../styles/chat.css';

/**
 * Displays an animated indicator representing that the assistant is "thinking"
 * or generating a response.
 *
 * Typically used while waiting for a streamed AI reply.
 *
 * @component
 * @returns {JSX.Element}
 */
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
