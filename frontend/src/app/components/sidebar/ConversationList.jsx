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

/**
 * Renders a list of user conversations in the sidebar.
 *
 * - Highlights the currently active conversation.
 * - Supports editing and deleting conversation titles.
 * - Displays category icons based on conversation type.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.conversations - Array of conversation objects
 * @param {string|number|null} props.currentConversationId - ID of the currently selected conversation
 * @param {(conversationId: string|number) => void} props.onSelect - Handler for selecting a conversation
 * @param {(conversationId: string|number) => void} props.onDelete - Handler for deleting a conversation
 * @param {(conversation: Object) => void} props.onEdit - Handler for initiating title edit
 * @param {string|number|null} props.editingTitleId - ID of the conversation being edited
 * @param {string} props.editingTitle - Current value of the title being edited
 * @param {(newTitle: string) => void} props.setEditingTitle - Setter for the title input value
 * @param {() => void} props.onSaveTitle - Handler to save the new title
 * @param {() => void} props.onCancelEdit - Handler to cancel the edit mode
 * @returns {JSX.Element}
 */
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

  /**
   * Handles keypress events within the title input field.
   *
   * - Pressing "Enter" saves the edited title.
   * - Pressing "Escape" cancels the edit mode.
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event object
   */
  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSaveTitle();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  /**
   * Returns an emoji icon for the given category value.
   *
   * - Handles both numeric and string-based category IDs.
   * - Defaults to the "general" icon if unrecognized.
   *
   * @param {string|number} category - The category ID or name
   * @returns {string} - Corresponding emoji icon
   */
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

  /**
   * Handles user clicks on a conversation item.
   *
   * - Prevents selection if the conversation is currently in title-edit mode.
   * - Otherwise, triggers the `onSelect` callback with the selected conversation ID.
   *
   * @param {Object} conv - The conversation object that was clicked
   * @param {string|number} conv.id - The unique identifier of the conversation
   */
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
