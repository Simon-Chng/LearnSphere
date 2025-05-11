import React from 'react';
import '../../styles/modal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Delete All Chats</h2>
        <p>Are you sure you want to delete all conversations? This action cannot be undone.</p>
        <div className="modal-buttons">
          <button className="modal-button cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-button delete" onClick={onConfirm}>
            Delete All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
