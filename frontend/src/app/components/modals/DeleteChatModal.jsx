import React from 'react';
import '../../styles/modal.css';

const DeleteChatModal = ({ isOpen, onClose, onConfirm, chatTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete Chat</h2>
        <p>Are you sure you want to delete &quot;{chatTitle}&quot;? This action cannot be undone.</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-button delete" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;
