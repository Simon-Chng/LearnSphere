import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_CONVERSATION = { id: 'default', title: 'New Chat', messages: [], model: 'llama3.2', category: 1 };

const CATEGORIES = [
  { id: 1, name: 'General', icon: '💬' },
  { id: 2, name: 'Goal Setting', icon: '🎯' },
  { id: 3, name: 'Problem Solving', icon: '💡' },
  { id: 4, name: 'Text Summarization', icon: '📝' },
  { id: 5, name: 'Emotional Support', icon: '❤️' },
  { id: 6, name: 'Social Learning', icon: '👥' }
];

const useChat = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [modelIdMap, setModelIdMap] = useState({});
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isThinking, setIsThinking] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [error, setError] = useState('');

  // Fetch available models
  const fetchModels = async (token) => {
    try {
      console.log('Fetching models with token:', token ? 'Token exists' : 'No token');
      
      // Build request headers
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:8000/models', {
        headers: headers,
      });
      
      if (!response.ok) {
        if (response.status === 401 && token) {
          console.error('Authentication failed - token may be invalid or expired');
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received models data:', data);
      
      if (data.models && Array.isArray(data.models)) {
        // Save full model info
        const modelNames = data.models.map(model => model.name);
        setAvailableModels(modelNames);
        
        // Create mapping from model name to ID
        const idMap = {};
        data.models.forEach(model => {
          idMap[model.name] = model.id;
        });
        setModelIdMap(idMap);
        
        // If the currently selected model is not in the available list, select the first available model
        if (modelNames.length > 0 && !modelNames.includes(selectedModel)) {
          setSelectedModel(modelNames[0]);
        }
      } else {
        console.error('Invalid models data format:', data);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      // Only handle authentication errors if token exists
      if (token && (error.message.includes('401') || error.message.includes('Not authenticated'))) {
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    }
  };

  const handleChat = async (userInput) => {
    if (!userInput || typeof userInput !== 'string' || !userInput.trim() || isThinking) return;
    
    try {
      setIsThinking(true);
      setInput(''); // Clear input after submitting
      
      const userMessage = {
        role: "user",
        content: userInput,
        timestamp: new Date().toISOString(),
      };

      // Update conversation state with user message
      const updatedConversation = {
        ...getCurrentConversation(),
        // Ensure category is an integer
        category: typeof getCurrentConversation().category === 'number' 
                ? getCurrentConversation().category 
                : 1,
        messages: [...getCurrentConversation().messages, userMessage],
      };
      
      // Update conversation in state
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === currentConversationId ? updatedConversation : conv
        )
      );

      // Get current model from the conversation
      const currentModel = updatedConversation.model || 'llama3.2';

      // Prepare request body based on user mode
      const requestBody = isGuest 
        ? {
            user_input: userInput,
            history: updatedConversation.messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            model: currentModel,
            category: parseInt(typeof updatedConversation.category === 'number' 
                    ? updatedConversation.category 
                    : 1)
          } 
        : {
            user_input: userInput,
            remember_history: true,
            history: updatedConversation.messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            model_id: modelIdMap[currentModel] || 1,
            // If it is a temporary ID or default, send null to let the backend create a new conversation
            conversation_id: currentConversationId !== 'default' && 
                            !currentConversationId.toString().startsWith('temp-') && 
                            !isNaN(parseInt(currentConversationId)) 
                            ? parseInt(currentConversationId) 
                            : null,
            // Ensure category_id is an integer
            category_id: parseInt(typeof updatedConversation.category === 'number' 
                        ? updatedConversation.category 
                        : 1)
          };
      
      // Add debug log
      console.log('Sending chat request in mode:', isGuest ? 'guest' : 'logged-in');
      console.log('Request body:', requestBody);
      console.log('Current conversation ID:', currentConversationId);
      console.log('Current conversation:', updatedConversation);

      // Make API request based on user mode
      const response = await fetch(
        isGuest ? "http://localhost:8000/guest/chat" : "http://localhost:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isGuest ? {} : { Authorization: `Bearer ${localStorage.getItem('token')}` }),
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For logged-in users, get the conversation ID created by the backend from the response header
      if (!isGuest) {
        const conversationId = response.headers.get('X-Conversation-ID');
        console.log('Received conversation ID from backend:', conversationId);
        
        if (conversationId && currentConversationId.toString().startsWith('temp-')) {
          // Replace temporary ID with real ID
          console.log(`Replacing temp ID ${currentConversationId} with real ID ${conversationId}`);
          
          // Update the ID in the conversation list
          setConversations(prevConversations => {
            const updatedConversations = prevConversations.map(conv => 
              conv.id === currentConversationId 
                ? { ...conv, id: Number(conversationId) }
                : conv
            );
            
            localStorage.setItem('hasIdUpdate', 'true');
            
            return updatedConversations;
          });
          
          // Update the current conversation ID
          setCurrentConversationId(Number(conversationId));
          
          // Set a flag to update the URL
          localStorage.setItem('updatedConversationId', conversationId);
          localStorage.setItem('previousTempId', currentConversationId);
        }
      }

      const reader = response.body.getReader();
      let aiResponse = "";
      let messageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        aiResponse += chunk;
        
        setConversations(prevConversations => 
          prevConversations.map(conv => {
            // Support the case where the ID may have been updated (temporary ID replaced with real ID)
            const isCurrentConversation = 
              conv.id === currentConversationId || 
              (typeof currentConversationId === 'number' && 
               conv.id === `temp-${currentConversationId}`);
               
            if (!isCurrentConversation) return conv;
            
            if (!messageAdded) {
              // Add new message for the first time
              messageAdded = true;
              return {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    role: "assistant",
                    content: chunk,
                    timestamp: new Date().toISOString(),
                  }
                ]
              };
            } else {
              // Update the content of the last message
              const updatedMessages = [...conv.messages];
              const lastIndex = updatedMessages.length - 1;
              
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content: aiResponse
              };
              
              return {
                ...conv,
                messages: updatedMessages
              };
            }
          })
        );
      }

      // Load from localStorage for guest mode
      if (isGuest) {
        // Get the latest conversations state
        const currentConversations = [...conversations];
        const updatedConversations = currentConversations.map(conv => 
          conv.id === currentConversationId 
            ? {
                ...conv,
                messages: [
                  ...conv.messages.filter(msg => msg.role !== "assistant" || msg.content !== aiResponse),
                  {
                    role: "assistant",
                    content: aiResponse,
                    timestamp: new Date().toISOString(),
                  }
                ]
              }
            : conv
        );
        
        localStorage.setItem("conversations", JSON.stringify(updatedConversations));
        localStorage.setItem("currentConversationId", currentConversationId);
      }

    } catch (error) {
      console.error("Error in handleChat:", error);
      setError(error.message);
    } finally {
      setIsThinking(false);
    }
  };

  // Initialize data based on user mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const guestMode = localStorage.getItem('isGuest') === 'true';
        setIsGuest(guestMode);

        // Always fetch models from server
        const token = localStorage.getItem('token');
        fetchModels(token);

        if (guestMode) {
          // Load from localStorage for guest mode
          const savedConversations = localStorage.getItem('conversations');
          const savedCurrentId = localStorage.getItem('currentConversationId');

          if (savedConversations) {
            // Guest mode: ensure ID is in string format and value is index+1
            const parsedConversations = JSON.parse(savedConversations);
            // Fix possible ID issues
            const fixedConversations = parsedConversations.map((conv, index) => ({
              ...conv,
              id: (index + 1).toString()
            }));
            setConversations(fixedConversations);
          } else {
            // Initial conversation ID is "1"
            setConversations([{...DEFAULT_CONVERSATION, id: "1"}]);
          }
          
          if (savedCurrentId) {
            setCurrentConversationId(savedCurrentId);
          } else {
            setCurrentConversationId("1");
          }
        } else {
          // Load from API for logged-in users
          if (!token) {
            router.push('/auth/login');
            return;
          }
          fetchConversations(token);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        // In guest mode, the initial conversation ID is "1"
        setConversations([{...DEFAULT_CONVERSATION, id: isGuest ? "1" : 'default'}]);
        setCurrentConversationId(isGuest ? "1" : 'default');
      } finally {
        setIsInitialized(true);
      }
    }
  }, []);

  // Save to localStorage only in guest mode
  useEffect(() => {
    if (isInitialized && isGuest) {
      try {
        localStorage.setItem('conversations', JSON.stringify(conversations));
        localStorage.setItem('currentConversationId', currentConversationId);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [conversations, currentConversationId, isInitialized, isGuest]);

  const fetchConversations = async (token) => {
    try {
      console.log('Fetching conversations with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('http://localhost:8000/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/auth/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received conversations data:', data);
      
      if (data.conversations && Array.isArray(data.conversations)) {
        // Ensure ID is numeric and category is integer
        const processedConversations = data.conversations.map(conv => {
          let categoryValue = 'general';
          
          if (typeof conv.category === 'number') {
            const categoryMap = {
              1: 'general',
              2: 'goal-setting',
              3: 'problem-solving',
              4: 'text-summarization',
              5: 'emotional-support',
              6: 'social-learning'
            };
            categoryValue = categoryMap[conv.category] || 'general';
          } else if (typeof conv.category === 'string') {
            const normalizedCategory = conv.category.toLowerCase().replace(/\s+/g, '-');
            const validCategories = [
              'general', 'goal-setting', 'problem-solving', 
              'text-summarization', 'emotional-support', 'social-learning'
            ];
            categoryValue = validCategories.includes(normalizedCategory) ? 
                            normalizedCategory : 'general';
          }
          
          return {
            ...conv,
            id: Number(conv.id),
            category: categoryValue
          };
        });
        
        setConversations(processedConversations);
        
        // Check the current path, only set the current conversation ID when visiting a specific conversation page
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          const isChatPage = path.match(/^\/chat\/(.+)$/);
          
          console.log('Current path:', path, 'Is chat page:', !!isChatPage);
          
          if (!isChatPage) {
            // If not on a specific chat page, set currentConversationId to null
            console.log('Not on a specific chat page, setting currentConversationId to null');
            setCurrentConversationId(null);
          } else {
            // If it is a specific chat page, extract the ID from the URL and match the conversation
            const chatIdFromUrl = isChatPage[1];
            console.log('Chat ID from URL:', chatIdFromUrl);
            
            if (chatIdFromUrl) {
              // Try to find the matching conversation
              const matchingConversation = processedConversations.find(
                conv => String(conv.id) === chatIdFromUrl
              );
              
              if (matchingConversation) {
                console.log('Found matching conversation:', matchingConversation.id);
                setCurrentConversationId(matchingConversation.id);
              } else {
                console.log('No matching conversation found, setting currentConversationId to null');
                setCurrentConversationId(null);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([DEFAULT_CONVERSATION]);
      setCurrentConversationId('default');
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversationId) || DEFAULT_CONVERSATION;
  };

  const updateConversationTitle = (conversationId, firstMessage) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId && conv.title === 'New Chat') {
        return {
          ...conv,
          title: firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage
        };
      }
      return conv;
    }));
  };

  return {
    conversations,
    setConversations,
    currentConversationId,
    setCurrentConversationId,
    input,
    setInput,
    response,
    setResponse,
    isInitialized,
    availableModels,
    selectedModel,
    setSelectedModel,
    selectedCategory,
    setSelectedCategory,
    categories: CATEGORIES,
    getCurrentConversation,
    handleChat,
    isThinking,
    isGuest,
    error
  };
};

export default useChat;
