import React from 'react';
import '../../styles/app.css';

/**
 * Displays a full-screen loading indicator with a spinner and message.
 *
 * Typically used during asynchronous data fetching or app initialization.
 *
 * @component
 * @returns {JSX.Element}
 */
const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingScreen;
