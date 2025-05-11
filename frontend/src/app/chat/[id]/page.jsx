"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useChat from "../../hooks/useChat";
import ChatInput from "../../components/chat/ChatInput";
import ChatHistory from "../../components/chat/ChatHistory";
import Header from "../../components/layout/Header";
import NewChatModal from "../../components/modals/NewChatModal";
import LoadingScreen from "../../components/common/LoadingScreen";
import ConversationManager from "../../components/handlers/ConversationManager";
import ConversationSidebar from "../../components/sidebar/ConversationSidebar";
import "../../styles/app.css";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.id;
  
  const {
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    input,
    setInput,
    response,
    setResponse,
    isInitialized,
    getCurrentConversation,
    handleChat,
    isThinking,
    availableModels,
    selectedModel,
    selectedCategory,
    setSelectedCategory,
    categories,
    isGuest
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isModelSelectOpen, setIsModelSelectOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Function to handle saving conversation title
  const handleSaveTitle = async () => {
    if (editingTitle.trim()) {
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === editingTitleId 
          ? { ...conv, title: editingTitle.trim() }
          : conv
      ));
      
      // In login mode, update backend data
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
      } else {
        console.log('Skip database update: guest mode or temporary conversation');
      }
    }
    setEditingTitleId(null);
  };

  // Set current conversation on component load
  useEffect(() => {
    console.log('Chat page loaded with chatId:', chatId, 'Conversations:', conversations);
    
    if (conversations.length > 0) {
      if (isGuest) {
        // Guest mode: use route parameter as ID directly
        const targetConversation = conversations.find(conv => String(conv.id) === String(chatId));
        if (targetConversation) {
          console.log('Found guest conversation:', targetConversation);
          setCurrentConversationId(targetConversation.id);
        } else {
          // If the corresponding conversation ID is not found, show the first one by default
          console.log('Guest conversation not found, using first one:', conversations[0]);
          setCurrentConversationId(conversations[0].id);
        }
      } else {
        // Login mode: find conversation by ID directly, not by index
        // Handle numeric ID and temporary ID
        try {
          // Convert to string for comparison
          const chatIdStr = String(chatId);
          console.log('Looking for conversation with ID (string):', chatIdStr);
          
          // Find matching conversation (use string comparison)
          const targetConversation = conversations.find(conv => String(conv.id) === chatIdStr);
          
          if (targetConversation) {
            console.log('Found conversation:', targetConversation);
            const conversationId = targetConversation.id;
            setCurrentConversationId(conversationId);
          } else {
            console.log('Conversation not found, chatId:', chatId);
            // If not found but there are other conversations, show the first one
            if (conversations.length > 0) {
              console.log('Showing first conversation instead:', conversations[0]);
              setCurrentConversationId(conversations[0].id);
            } else if (isInitialized) {
              // If there are no conversations, redirect to home page
              console.log('No conversations found, redirecting to /chat');
              router.push('/chat');
            }
          }
        } catch (error) {
          console.error('Error finding conversation:', error);
          // If error occurs, show the first conversation by default
          if (conversations.length > 0) {
            setCurrentConversationId(conversations[0].id);
          }
        }
      }
    }
  }, [chatId, conversations, setCurrentConversationId, isGuest, isInitialized, router]);

  // Handle navigation
  useEffect(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  // Listen for ID update and update URL
  useEffect(() => {
    if (typeof window !== 'undefined' && !isGuest) {
      const updatedId = localStorage.getItem('updatedConversationId');
      const previousTempId = localStorage.getItem('previousTempId');
      
      if (updatedId && previousTempId && chatId === previousTempId) {
        console.log(`Updating URL from ${previousTempId} to ${updatedId}`);
        
        // Use history.replaceState to update URL without page refresh
        window.history.replaceState(
          null, 
          '', 
          window.location.pathname.replace(previousTempId, updatedId)
        );
        
        // Clear flag to prevent repeated updates
        localStorage.removeItem('updatedConversationId');
        localStorage.removeItem('previousTempId');
      }
    }
  }, [chatId, isGuest, currentConversationId]);

  // Render loading state
  if (!isInitialized) {
    return (
      <div className="app-container">
        <LoadingScreen />
      </div>
    );
  }

  const handleConversationSelect = (id) => {
    console.log(`Selecting conversation with ID: ${id}`);
    setCurrentConversationId(id);
    
    if (isGuest) {
      // Guest mode: use ID as route parameter directly
      router.push(`/chat/${id}`);
    } else {
      // Login mode: use actual ID from database as route parameter directly
      // No conversion needed, keep the original format of ID (number or temporary ID string)
      const newPath = `/chat/${id}`;
      console.log(`Navigating to: ${newPath}`);
      
      // Check if navigation is needed (current path is different from target path)
      if (window.location.pathname !== newPath) {
        try {
          console.log("Using router.push for navigation");
          router.push(newPath);
          
          // If router navigation fails, use native navigation as fallback
          setTimeout(() => {
            if (window.location.pathname !== newPath) {
              console.log("Router navigation seems to have failed, using direct location change");
              window.location.href = newPath;
            }
          }, 100);
        } catch (error) {
          console.error("Navigation error:", error);
          // Use native navigation as fallback on error
          window.location.href = newPath;
        }
      } else {
        console.log('Already on this conversation, no navigation needed');
      }
    }
  };

  const handleModelSelect = async (model, category) => {
    setIsModelSelectOpen(false);
    
    // Ensure category is a number
    const categoryId = typeof category === 'number' ? category : parseInt(category) || 1;
    console.log(`Creating new chat with model: ${model}, category: ${categoryId}`);
    
    if (isGuest) {
      // Guest mode: handle on client side
      // Use the number of existing conversations + 1 as the new conversation ID
      const newId = (conversations.length + 1).toString();
      setConversations(prev => {
        const newConversations = [...prev, {
          id: newId,
          title: "New Chat",
          messages: [],
          model: model,
          category: categoryId
        }];
        return newConversations;
      });
      setCurrentConversationId(newId);
      setPendingNavigation(`/chat/${newId}`);
    } else {
      // Login mode: create new conversation via API
      try {
        // Create an empty message to initialize the conversation
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        // Use a consistent temporary ID
        const tempId = `temp-${Date.now()}`;
        console.log(`Created temporary ID for new conversation: ${tempId}`);
        
        // First create the conversation, it will be saved to backend when user sends the first message
        setConversations(prev => {
          const newConversations = [...prev, {
            id: tempId,
            title: "New Chat",
            messages: [],
            model: model,
            category: categoryId
          }];
          return newConversations;
        });
        
        // Set as current conversation and navigate
        // Use temporary ID as route parameter directly
        setCurrentConversationId(tempId);
        setPendingNavigation(`/chat/${tempId}`);
        
      } catch (error) {
        console.error("Error creating new chat:", error);
      }
    }
  };

  return (
    <div className="app-container">
      <NewChatModal
        isOpen={isModelSelectOpen}
        onClose={() => setIsModelSelectOpen(false)}
        availableModels={availableModels}
        selectedModel={selectedModel}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={handleModelSelect}
      />
      <Header onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
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
          onCreateNewChat={() => setIsModelSelectOpen(true)}
          editingTitleId={editingTitleId}
          editingTitle={editingTitle}
          setEditingTitle={setEditingTitle}
          onSaveTitle={handleSaveTitle}
          onCancelEdit={() => setEditingTitleId(null)}
          onEditTitle={(conv) => {
            setEditingTitleId(conv.id);
            setEditingTitle(conv.title);
          }}
        />
      </ConversationManager>
      <div className="main-content">
        <h1 className="title">LearnSphere</h1>
        <div className="chat-history">
          <ChatHistory
            messages={getCurrentConversation()?.messages || []}
            isThinking={isThinking}
            response={response}
          />
        </div>
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={(inputValue) => {
            console.log('Submitting message with currentConversationId:', currentConversationId);
            console.log('Current conversation state:', getCurrentConversation());
            handleChat(inputValue);
          }}
          disabled={isThinking}
        />
      </div>
    </div>
  );
}
