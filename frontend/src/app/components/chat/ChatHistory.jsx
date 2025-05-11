import React from 'react';
import Message from './Message';
import ThinkingIndicator from './ThinkingIndicator';
import getGreeting from '../../utils/greeting';

const ChatHistory = ({ messages = [], isThinking, response }) => {
  if (!messages.length) {
    return (
      <div className="empty-chat">
        <p>{getGreeting()}<br />How can I help you today? &#x2728;</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg, index) => (
        <Message key={index} role={msg.role} content={msg.content} />
      ))}
      {isThinking && <ThinkingIndicator />}
      {response && messages.every(msg => msg.content !== response) && (
        <Message role="assistant" content={response} />
      )}
    </>
  );
};

export default ChatHistory;
