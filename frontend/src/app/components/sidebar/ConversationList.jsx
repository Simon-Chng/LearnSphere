import React, { useRef, useEffect } from 'react';
import '../../styles/sidebar.css';

// Define categories and their corresponding emojis
const CATEGORY_ICONS = {
  'general': '💬',
  'goal-setting': '🎯',
  'problem-solving': '💡',
  'text-summarization': '📝',
  'emotional-support': '❤️',
  'social-learning': '👥'
};

const ConversationList = ({
  conversations = [],
  currentConversationId,
  onSelect,
  onDelete,
  onEdit,
  editingTitleId,
  editingTitle,
  setEditingTitle,
  onSaveTitle,
  onCancelEdit
}) => {
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (editingTitleId && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitleId]);

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSaveTitle();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  // Get the emoji for the conversation category
  const getCategoryIcon = (category) => {
    console.log('Category value received:', category, 'Type:', typeof category);
    
    // If category is a numeric ID, convert it to corresponding name
    let categoryKey = 'general'; // Default to general category
    
    // Guest mode
    if (typeof category === 'number') {
      const categoryMap = {
        1: 'general',
        2: 'goal-setting',
        3: 'problem-solving',
        4: 'text-summarization',
        5: 'emotional-support',
        6: 'social-learning'
      };
      categoryKey = categoryMap[category] || 'general';
    } else if (typeof category === 'string') {
      // Login mode
      categoryKey = category;
    }
    
    // Return the corresponding icon, or default icon if not found
    return CATEGORY_ICONS[categoryKey] || '💬';
  };

  // Add function to handle click events
  const handleConversationClick = (conv) => {
    if (editingTitleId !== conv.id) {
      console.log(`ConversationList: Clicked on conversation ID: ${conv.id}, type: ${typeof conv.id}`);
      onSelect(conv.id);
    }
  };

  return (
    <div className="conversation-list">
      {conversations.map(conv => (
        <div
          key={conv.id}
          className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
          onClick={() => handleConversationClick(conv)}
        >
          {editingTitleId === conv.id ? (
            <div className="title-edit-container">
              <input
                ref={titleInputRef}
                type="text"
                className="title-edit-input"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyPress={handleTitleKeyPress}
              />
              <div className="title-edit-buttons">
                <button
                  className="title-edit-button confirm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveTitle();
                  }}
                >
                  &#x2713;
                </button>
                <button
                  className="title-edit-button cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelEdit();
                  }}
                >
                  &#x2715;
                </button>
              </div>
            </div>
          ) : (
            <div className="conversation-title-container">
              <span className="conversation-icon">{getCategoryIcon(conv.category)}</span>
              <span className="conversation-title">{conv.title}</span>
              <span className="model-tag">{conv.model}</span>
              <button
                className="rename-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(conv);
                }}
              >
                &#x270E;
              </button>
              <button
                className="delete-conversation"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
              >
                &#x2716;
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
