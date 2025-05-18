import React from 'react';

/**
 * Renders a conversation title as editable input when in edit mode,
 * or as a static span when not editing. Provides buttons for saving or canceling edits.
 *
 * @component
 * @param {Object} props
 * @param {string|number} props.editingTitleId - The ID of the conversation currently being edited.
 * @param {string} props.editingTitle - The current value of the title being edited.
 * @param {function} props.setEditingTitle - Function to update the editing title state.
 * @param {function} props.onSaveTitle - Function to call when saving the title.
 * @param {function} props.onCancelEdit - Function to call when canceling the edit.
 * @param {function} props.onEditTitle - Function to enter edit mode for a conversation.
 * @param {Object} props.conversation - The conversation object with `id` and `title`.
 * @returns {JSX.Element}
 */
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
