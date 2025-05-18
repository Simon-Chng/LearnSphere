import React from 'react';
import getGreeting from '../../utils/greeting';
import '../../styles/app.css';

/**
 * Welcome screen component that displays a greeting and a button
 * to start a new chat conversation in the LearnSphere application.
 *
 * @component
 * @param {Object} props
 * @param {function} props.onStartNewChat - Callback function invoked when the "Start New Chat" button is clicked.
 * @returns {JSX.Element}
 */
const WelcomeScreen = ({ onStartNewChat }) => {
  return (
    <div className="welcome-screen">
      <h2>Welcome to LearnSphere</h2>
      <p>{getGreeting()}<br />Ready to start a new conversation? &#x2728;</p>
      <button 
        className="create-chat-button"
        onClick={onStartNewChat}
      >
        Start New Chat
      </button>
    </div>
  );
};

export default WelcomeScreen;
