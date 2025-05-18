import React from 'react';
import ConversationList from './ConversationList';
import '../../styles/sidebar.css';

/**
 * Sidebar component for managing and displaying the user's chat history.
 *
 * - Includes button to create a new conversation.
 * - Renders a list of past conversations via `ConversationList`.
 * - Supports editing, deleting, and clearing all conversations.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the sidebar is visible
 * @param {Array<Object>} props.conversations - List of conversation objects
 * @param {string|number|null} props.currentConversationId - ID of the currently active conversation
 * @param {(id: string|number) => void} props.onConversationSelect - Callback when a conversation is selected
 * @param {() => void} props.onCreateNewChat - Callback to create a new chat
 * @param {() => void} props.onClearAll - Callback to clear all chat history
 * @param {(id: string|number) => void} props.onDeleteConversation - Callback to delete a conversation
 * @param {(conversation: Object) => void} props.onEditTitle - Callback to start editing a conversation title
 * @param {string|number|null} props.editingTitleId - ID of the conversation currently being edited
 * @param {string} props.editingTitle - Title currently being edited
 * @param {(title: string) => void} props.setEditingTitle - Setter function for the editing title state
 * @param {() => void} props.onSaveTitle - Callback to save the edited title
 * @param {() => void} props.onCancelEdit - Callback to cancel editing
 * @returns {JSX.Element}
 */
const ConversationSidebar = ({
  isOpen,
  conversations,
  currentConversationId,
  onConversationSelect,
  onCreateNewChat,
  onClearAll,
  onDeleteConversation,
  onEditTitle,
  editingTitleId,
  editingTitle,
  setEditingTitle,
  onSaveTitle,
  onCancelEdit
}) => {
  /**
   * Wrapper to handle selecting a conversation from the list.
   *
   * @param {string|number} id - The ID of the selected conversation
   */
  const handleSelect = (id) => {
    console.log(`ConversationSidebar: Selecting conversation ID: ${id}`);
    onConversationSelect(id);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">Chat History</span>
        <div className="header-buttons">
          <button onClick={onCreateNewChat} className="new-chat-icon">
            <svg className="new-chat-icon-svg" viewBox="0 0 16 16">
              <line x1="8" y1="1" x2="8" y2="15" />
              <line x1="1" y1="8" x2="15" y2="8" />
            </svg>
          </button>
        </div>
      </div>
      <ConversationList
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelect={handleSelect}
        onDelete={onDeleteConversation}
        onEdit={onEditTitle}
        editingTitleId={editingTitleId}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        onSaveTitle={onSaveTitle}
        onCancelEdit={onCancelEdit}
      />
      <button onClick={onClearAll} className="clear-all-button">
        Clear All Chats
      </button>
    </div>
  );
};

export default ConversationSidebar;
