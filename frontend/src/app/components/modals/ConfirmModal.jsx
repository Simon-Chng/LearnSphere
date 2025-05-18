import React from 'react';
import '../../styles/modal.css';

/**
 * ConfirmModal is a reusable modal component that asks the user to confirm
 * a destructive action, such as clearing all chat conversations.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Determines whether the modal is visible.
 * @param {Function} props.onClose - Callback to close the modal without confirming.
 * @param {Function} props.onConfirm - Callback to execute the destructive action.
 * @returns {JSX.Element|null} The modal JSX if open, otherwise null.
 */
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
