import React from 'react';

const TitleEditor = ({
  editingTitleId,
  editingTitle,
  setEditingTitle,
  onSaveTitle,
  onCancelEdit,
  onEditTitle,
  conversation
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSaveTitle();
    } else if (e.key === 'Escape') {
      onCancelEdit();
    }
  };

  if (editingTitleId === conversation.id) {
    return (
      <div className="title-edit-container" onClick={e => e.stopPropagation()}>
        <input
          type="text"
          className="title-edit-input"
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="title-edit-buttons">
          <button
            className="title-edit-button confirm"
            onClick={onSaveTitle}
          >
            &#x2713;
          </button>
          <button
            className="title-edit-button cancel"
            onClick={onCancelEdit}
          >
            &#x2715;
          </button>
        </div>
      </div>
    );
  }

  return (
    <span onClick={() => onEditTitle(conversation)}>
      {conversation.title}
    </span>
  );
};

export default TitleEditor; 