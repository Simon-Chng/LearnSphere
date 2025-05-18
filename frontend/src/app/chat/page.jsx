"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useChat from "../hooks/useChat";
import Header from "../components/layout/Header";
import NewChatModal from "../components/modals/NewChatModal";
import LoadingScreen from "../components/common/LoadingScreen";
import EmptyChat from "../components/common/EmptyChat";
import ConversationManager from "../components/handlers/ConversationManager";
import ConversationSidebar from "../components/sidebar/ConversationSidebar";
import "../styles/app.css";

/**
 * ChatListPage is the main dashboard for viewing and managing conversations.
 * It includes sidebar navigation, model/category selection for new chats, and an empty state display.
 * Redirects users to the selected or newly created chat.
 *
 * @component
 * @returns {JSX.Element} The full chat list UI with modals and navigation logic.
 */
export default function ChatListPage() {
  const router = useRouter();
  const {
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    isInitialized,
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

  // Handle navigation
  useEffect(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  // Render loading state
  if (!isInitialized) {
    return (
      <div className="app-container">
        <LoadingScreen />
      </div>
    );
  }

  /**
   * Handle user selecting a conversation from the sidebar.
   * Navigates to the corresponding chat detail page.
   *
   * @param {string} id - The conversation ID to navigate to
   */
  const handleConversationSelect = (id) => {
    const index = conversations.findIndex(conv => conv.id === id) + 1;
    router.push(`/chat/${index}`);
  };

  /**
   * Handle creating a new conversation with a selected model and category.
   * Adds the conversation, sets it as current, and triggers navigation.
   *
   * @param {string} model - The selected model ID
   * @param {string} category - The selected category
   */
  const handleModelSelect = (model, category) => {
    setIsModelSelectOpen(false);
    const newId = Date.now().toString();
    setConversations(prev => {
      const newConversations = [...prev, {
        id: newId,
        title: "New Chat",
        messages: [],
        model: model,
        category: category
      }];
      return newConversations;
    });
    setCurrentConversationId(newId);
    const newIndex = conversations.length + 1;
    setPendingNavigation(`/chat/${newIndex}`);
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
          onSaveTitle={() => {
            if (editingTitle.trim()) {
              setConversations(prev => prev.map(conv => 
                conv.id === editingTitleId 
                  ? { ...conv, title: editingTitle.trim() }
                  : conv
              ));
            }
            setEditingTitleId(null);
          }}
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
          <EmptyChat />
        </div>
      </div>
    </div>
  );
}
