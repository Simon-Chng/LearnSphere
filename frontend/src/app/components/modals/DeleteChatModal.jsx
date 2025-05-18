import React from 'react';
import '../../styles/modal.css';

/**
 * DeleteChatModal displays a confirmation dialog for deleting a specific chat conversation.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is currently visible.
 * @param {Function} props.onClose - Function to call when the cancel button is clicked or modal is dismissed.
 * @param {Function} props.onConfirm - Function to call when the delete action is confirmed.
 * @param {string} props.chatTitle - The title of the chat to be displayed in the confirmation message.
 * @returns {JSX.Element|null} The modal JSX if open, otherwise null.
 */
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
