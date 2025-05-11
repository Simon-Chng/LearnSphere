"use client";

import { useAppNavigation } from "../hooks/useAppNavigation";

export default function AppsPage() {
  const { handleCategorySelect } = useAppNavigation('all');

  return (
    <div className="welcome-screen apps-welcome">
      <h2>Welcome to LearnSphere</h2>
      <p>Ready to enhance your Self-Regulated Learning experience? ✨</p>
      <p>Select a feature from the sidebar to get started:</p>
      <div className="feature-list">
        <div className="feature-item" onClick={() => handleCategorySelect('goal-setting')}>
          <span className="feature-icon">🎯</span>
          <span className="feature-name">Goal Setting</span>
          <span className="feature-desc">Set and track your learning objectives</span>
        </div>
        <div className="feature-item" onClick={() => handleCategorySelect('problem-solving')}>
          <span className="feature-icon">💡</span>
          <span className="feature-name">Problem Solving</span>
          <span className="feature-desc">Get real-time assistance with academic challenges</span>
        </div>
        <div className="feature-item" onClick={() => handleCategorySelect('text-summarization')}>
          <span className="feature-icon">📝</span>
          <span className="feature-name">Text Summarization</span>
          <span className="feature-desc">Generate concise summaries of your study materials</span>
        </div>
        <div className="feature-item" onClick={() => handleCategorySelect('emotional-support')}>
          <span className="feature-icon">❤️</span>
          <span className="feature-name">Emotional Support</span>
          <span className="feature-desc">Receive encouragement and emotional guidance</span>
        </div>
        <div className="feature-item" onClick={() => handleCategorySelect('social-learning')}>
          <span className="feature-icon">👥</span>
          <span className="feature-name">Social Learning</span>
          <span className="feature-desc">Connect with peers and share learning experiences</span>
        </div>
      </div>
    </div>
  );
}
