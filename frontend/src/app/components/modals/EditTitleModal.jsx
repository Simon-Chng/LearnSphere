import React from 'react';

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
