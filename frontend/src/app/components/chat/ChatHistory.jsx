import React from 'react';
import Message from './Message';
import ThinkingIndicator from './ThinkingIndicator';
import getGreeting from '../../utils/greeting';

/**
 * Renders the chat history between the user and the assistant.
 *
 * - Shows a greeting if there are no messages.
 * - Displays each message in order.
 * - Optionally shows a thinking indicator if a response is pending.
 * - Displays a temporary streaming response if not yet part of the message list.
 *
 * @component
 * @param {Object} props
 * @param {Array<{ role: string, content: string }>} props.messages - Array of chat messages
 * @param {boolean} props.isThinking - Whether the assistant is currently generating a response
 * @param {string} props.response - Current assistant response being streamed
 * @returns {JSX.Element}
 */
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
