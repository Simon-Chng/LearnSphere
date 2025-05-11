import React from 'react';
import ConversationList from './ConversationList';
import '../../styles/sidebar.css';

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
