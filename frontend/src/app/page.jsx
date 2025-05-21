"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useChat from "./hooks/useChat";
import ConversationSidebar from "./components/sidebar/ConversationSidebar";
import Header from "./components/layout/Header";
import NewChatModal from "./components/modals/NewChatModal";
import LoadingScreen from "./components/common/LoadingScreen";
import WelcomeScreen from "./components/common/WelcomeScreen";
import ConversationManager from "./components/handlers/ConversationManager";
import DeleteChatModal from "./components/modals/DeleteChatModal";
import "./styles/app.css";

export default function ChatApp() {
  const router = useRouter();
  const {
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    response,
    setResponse,
    isInitialized,
    availableModels,
    selectedModel,
    setSelectedModel,
    selectedCategory,
    setSelectedCategory,
    categories,
    handleChat,
    isThinking,
    isGuest
  } = useChat();

  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  // Function to save conversation title
  const handleSaveTitle = async () => {
    if (editingTitle.trim()) {
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === editingTitleId 
          ? { ...conv, title: editingTitle.trim() }
          : conv
      ));
      
      // Update backend data in logged-in mode
      if (!isGuest && !String(editingTitleId).startsWith('temp-')) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          console.log(`Updating conversation title in database for ID: ${editingTitleId}`);
          const response = await fetch(`http://localhost:8000/conversations/${editingTitleId}/title`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: editingTitle.trim() })
          });
          
          if (!response.ok) {
            console.error(`Error updating conversation title: ${response.status}`);
          } else {
            console.log('Conversation title updated successfully in database');
          }
        } catch (error) {
          console.error('Error updating title:', error);
        }
      }
    }
    setEditingTitleId(null);
  };

  // Cancel title editing
  const handleCancelEdit = () => {
    setEditingTitleId(null);
  };
  
  // Start editing title
  const handleEditTitle = (conv) => {
    setEditingTitleId(conv.id);
    setEditingTitle(conv.title);
  };
  
  // Open new chat modal
  const handleCreateNewChat = () => {
    setIsModelSelectOpen(true);
  };
  
  // Toggle sidebar
  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  // Handle model selection and create new chat
  const handleModelSelect = async (model, category) => {
    setIsModelSelectOpen(false);
    
    if (!isGuest) {
      // Logged-in mode: Create conversation on server
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        // Get model ID from server
        const modelResponse = await fetch('http://localhost:8000/models', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!modelResponse.ok) {
          throw new Error(`HTTP error! status: ${modelResponse.status}`);
        }
        
        const modelData = await modelResponse.json();
        const selectedModel = modelData.models.find(m => m.name === model);
        if (!selectedModel) {
          throw new Error('Selected model not found');
        }

        // Create new conversation on server
        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_input: "New conversation",
            remember_history: false,
            history: [],
            model_id: selectedModel.id,
            category_id: parseInt(category)
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newConversationId = response.headers.get('X-Conversation-ID');
        if (newConversationId) {
          // Add the new conversation to the local state
          setConversations(prev => [...prev, {
            id: newConversationId,
            title: "New Chat",
            messages: [],
            model: model,
            category: parseInt(category)
          }]);
          setCurrentConversationId(newConversationId);
          router.push(`/chat/${newConversationId}`);
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
      }
    } else {
      // Guest mode: Create conversation locally
      // Use current conversation count + 1 as new conversation ID to ensure consistent ID format
      const newId = (conversations.length + 1).toString();
      console.log(`Creating new guest conversation with ID: ${newId}`);
      
      setConversations(prev => {
        const newConversations = [...prev, {
          id: newId,
          title: "New Chat",
          messages: [],
          model: model,
          category: parseInt(category)
        }];
        return newConversations;
      });
      setCurrentConversationId(newId);
      router.push(`/chat/${newId}`);
    }
  };
  
  // Handle close modal
  const handleCloseModal = () => {
    setIsModelSelectOpen(false);
  };
  
  // Handle confirm delete conversation
  const handleConfirmDelete = () => {
    if (chatToDelete) {
      setConversations(prev => prev.filter(conv => conv.id !== chatToDelete));
      setCurrentConversationId(null);
    }
    setIsDeleteModalOpen(false);
    setChatToDelete(null);
  };
  
  // Handle close delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  // Handle navigation
  useEffect(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  // Reset current conversation when component mounts
  useEffect(() => {
    console.log("Home page mounted, resetting currentConversationId to null");
    setCurrentConversationId(null);
    
    // Log current mode
    console.log("Current mode:", isGuest ? "Guest" : "Logged-in");
    console.log("Available conversations:", conversations.length);
  }, [isGuest, conversations.length]);

  const handleConversationSelect = (id) => {
    console.log(`Home page: Selecting conversation with ID: ${id}`);
    setCurrentConversationId(id);
    
    if (isGuest) {
      // Guest mode: use ID directly as route parameter
      router.push(`/chat/${id}`);
    } else {
      // Logged-in mode: use actual ID from database as route parameter
      // No conversion needed, maintain original ID format (number or temporary ID string)
      const newPath = `/chat/${id}`;
      console.log(`Navigating to: ${newPath}`);
      
      // Check if navigation is needed (current path differs from target path)
      try {
        console.log("Using router.push for navigation");
        router.push(newPath);
        
        // If router navigation fails, use direct location change as fallback
        setTimeout(() => {
          if (window.location.pathname !== newPath) {
            console.log("Router navigation seems to have failed, using direct location change");
            window.location.href = newPath;
          }
        }, 100);
      } catch (error) {
        console.error("Navigation error:", error);
        // Use direct location change as fallback in case of error
        window.location.href = newPath;
      }
    }
  };

  return (
    <div className="app-container" data-path="/">
      <Header onToggleSidebar={handleToggleSidebar} />
      <ConversationManager
        conversations={conversations}
        setConversations={setConversations}
        currentConversationId={currentConversationId}
        setCurrentConversationId={setCurrentConversationId}
        isGuest={isGuest}
      >
        <ConversationSidebar
          isOpen={isSidebarOpen}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          onCreateNewChat={handleCreateNewChat}
          editingTitleId={editingTitleId}
          setEditingTitleId={setEditingTitleId}
          editingTitle={editingTitle}
          setEditingTitle={setEditingTitle}
          onSaveTitle={handleSaveTitle}
          onCancelEdit={handleCancelEdit}
          onEditTitle={handleEditTitle}
        />
      </ConversationManager>
      <div className="main-content">
        {!isInitialized ? (
          <LoadingScreen />
        ) : (
          // Always show WelcomeScreen on home page, regardless of conversation history
          <WelcomeScreen onStartNewChat={handleCreateNewChat} />
        )}
      </div>
      {isModelSelectOpen && (
        <NewChatModal
          isOpen={isModelSelectOpen}
          onClose={handleCloseModal}
          availableModels={availableModels}
          selectedModel={selectedModel}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelect={handleModelSelect}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteChatModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
