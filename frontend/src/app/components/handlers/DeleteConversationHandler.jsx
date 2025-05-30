import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeleteChatModal from '../modals/DeleteChatModal';
import ConfirmModal from '../modals/ConfirmModal';

/**
 * DeleteConversationHandler handles deletion of individual conversations
 * and clearing of all conversations in memory. It provides confirmation modals
 * and injects deletion handlers into its children (specifically targeting
 * components named "Sidebar").
 *
 * @component
 * @param {Object} props
 * @param {Array} props.conversations - List of all current conversation objects.
 * @param {Function} props.setConversations - Function to update the conversations list.
 * @param {string|number|null} props.currentConversationId - The ID of the currently active conversation.
 * @param {Function} props.setCurrentConversationId - Function to set the active conversation ID.
 * @param {Function} [props.setResponse] - Optional function to reset the chat response.
 * @param {React.ReactNode} props.children - React children, where Sidebar receives injected props.
 * @returns {JSX.Element}
 */
const DeleteConversationHandler = ({
  conversations,
  setConversations,
  currentConversationId,
  setCurrentConversationId,
  setResponse,
  children
}) => {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Delete single conversation
  const deleteConversation = (id) => {
    const chat = conversations.find(conv => conv.id === id);
    if (chat) {
      setChatToDelete({ id, title: chat.title });
      setIsDeleteModalOpen(true);
    }
  };

  // Handle actual deletion of a single chat
  const handleConfirmDelete = () => {
    if (chatToDelete) {
      const remainingConvs = conversations.filter(conv => conv.id !== chatToDelete.id);
      setConversations(remainingConvs);
      
      if (currentConversationId === chatToDelete.id) {
        if (remainingConvs.length > 0) {
          setCurrentConversationId(remainingConvs[0].id);
          const newIndex = remainingConvs.findIndex(conv => conv.id === remainingConvs[0].id) + 1;
          router.push(`/chat/${newIndex}`);
        } else {
          setCurrentConversationId(null);
          router.push('/chat');
        }
        if (setResponse) {
          setResponse("");
        }
      }
      
      setIsDeleteModalOpen(false);
      setChatToDelete(null);
    }
  };

  // Clear all conversations
  const clearAllConversations = () => {
    setIsConfirmModalOpen(true);
  };

  // Handle actual deletion of all chats
  const handleConfirmClear = () => {
    setConversations([]);
    setCurrentConversationId(null);
    if (setResponse) {
      setResponse("");
    }
    setIsConfirmModalOpen(false);
    router.push('/chat');
  };

  return (
    <>
      <DeleteChatModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setChatToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        chatTitle={chatToDelete?.title || ""}
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmClear}
      />
      {React.Children.map(children, child => {
        // Add delete-related props only for Sidebar component
        if (child.type.name === 'Sidebar') {
          return React.cloneElement(child, {
            onDeleteConversation: deleteConversation,
            onClearAll: clearAllConversations
          });
        }
        // Keep other components unchanged
        return child;
      })}
    </>
  );
};

export default DeleteConversationHandler;
