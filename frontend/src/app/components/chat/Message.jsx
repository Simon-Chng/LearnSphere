import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../styles/chat.css';

/**
 * Displays a single chat message using Markdown formatting.
 *
 * - Applies different styles based on message role (`user` or `assistant`).
 * - Supports GitHub-flavored Markdown via `remark-gfm`.
 *
 * @component
 * @param {Object} props
 * @param {"user" | "assistant"} props.role - The role of the message sender
 * @param {string} props.content - Markdown-formatted message content
 * @returns {JSX.Element}
 */
const Message = ({ role, content }) => {
  return (
    <div className={`message ${role}`}>
      <div className="message-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default Message;
