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

  const handleConversationSelect = (id) => {
    const index = conversations.findIndex(conv => conv.id === id) + 1;
    router.push(`/chat/${index}`);
  };

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
