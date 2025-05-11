import React from 'react';
import '../../styles/app.css';

const EmptyChat = () => {
  return (
    <div className="empty-chat">
      <p>No active conversations.<br />Create a new chat to get started.</p>
    </div>
  );
};

export default EmptyChat;
