import React from 'react';

/**
 * EditTitleModal allows the user to edit the title of a conversation.
 *
 * @component
 * @param {Object} props
 * @param {string|null} props.editingTitleId - ID of the conversation being edited; if null, modal is hidden.
 * @param {string} props.editingTitle - Current value of the edited title input.
 * @param {Function} props.setEditingTitle - Function to update the title input value.
 * @param {Function} props.onSave - Callback to execute after a successful title save.
 * @param {Function} props.onCancel - Callback to execute when the editing is cancelled.
 * @param {Function} props.setConversations - Function to update the conversations list with the new title.
 * @returns {JSX.Element|null} The title edit modal if `editingTitleId` is set, otherwise null.
 */
const EditTitleModal = ({
  editingTitleId,
  editingTitle,
  setEditingTitle,
  onSave,
  onCancel,
  setConversations
}) => {
  const handleSave = () => {
    if (editingTitle.trim()) {
      setConversations(prev => prev.map(conv => 
        conv.id === editingTitleId 
          ? { ...conv, title: editingTitle.trim() }
          : conv
      ));
      onSave();
    }
  };

  if (!editingTitleId) return null;

  return (
    <div className="title-edit-container" onClick={e => e.stopPropagation()}>
      <input
        type="text"
        className="title-edit-input"
        value={editingTitle}
        onChange={(e) => setEditingTitle(e.target.value)}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave();
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
      />
      <div className="title-edit-buttons">
        <button
          className="title-edit-button confirm"
          onClick={handleSave}
        >
          &#x2713;
        </button>
        <button
          className="title-edit-button cancel"
          onClick={onCancel}
        >
          &#x2715;
        </button>
      </div>
    </div>
  );
};

export default EditTitleModal;
