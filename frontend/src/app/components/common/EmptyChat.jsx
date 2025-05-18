import React from 'react';
import '../../styles/app.css';

/**
 * Displays a placeholder message when there are no active conversations.
 *
 * Typically shown when the chat history is empty or no conversation is selected.
 *
 * @component
 * @returns {JSX.Element}
 */
const EmptyChat = () => {
  return (
    <div className="empty-chat">
      <p>No active conversations.<br />Create a new chat to get started.</p>
    </div>
  );
};

export default EmptyChat;
