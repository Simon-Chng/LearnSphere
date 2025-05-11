import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeleteChatModal from '../modals/DeleteChatModal';
import ConfirmModal from '../modals/ConfirmModal';

const ConversationManager = ({
  conversations,
  setConversations,
  currentConversationId,
  setCurrentConversationId,
  isGuest,
  children
}) => {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const deleteConversation = (id) => {
    const chat = conversations.find(conv => conv.id === id);
    if (chat) {
      setChatToDelete({ id, title: chat.title });
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;

    // Update local state first
    const remainingConvs = conversations.filter(conv => conv.id !== chatToDelete.id);
    setConversations(remainingConvs);
    
    // Update localStorage in guest mode
    if (isGuest) {
      localStorage.setItem('conversations', JSON.stringify(remainingConvs));
    } else {
      // Logged-in mode: Delete from server
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`http://localhost:8000/conversations/${chatToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        return;
      }
    }
    
    if (currentConversationId === chatToDelete.id) {
      if (remainingConvs.length > 0) {
        setCurrentConversationId(remainingConvs[0].id);
        router.push(`/chat/${remainingConvs[0].id}`);
      } else {
        setCurrentConversationId(null);
        router.push('/chat');
      }
    }
    
    setIsDeleteModalOpen(false);
    setChatToDelete(null);
  };

  const clearAllConversations = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmClear = async () => {
    // Update local state first
    setConversations([]);
    setCurrentConversationId(null);
    
    // Update localStorage in guest mode
    if (isGuest) {
      localStorage.setItem('conversations', JSON.stringify([]));
    } else {
      // Logged-in mode: Delete all conversations from server
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Delete each conversation
        for (const conv of conversations) {
          const response = await fetch(`http://localhost:8000/conversations/${conv.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
      } catch (error) {
        console.error('Error clearing conversations:', error);
        return;
      }
    }
    
    router.push('/chat');
    setIsConfirmModalOpen(false);
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
        return React.cloneElement(child, {
          onDeleteConversation: deleteConversation,
          onClearAll: clearAllConversations
        });
      })}
    </>
  );
};

export default ConversationManager;
