
import React, { useState, useRef, useEffect } from 'react';
import { Sender, Message, PriceData, ChatSession, Provider } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';
import ShareModal from './components/ShareModal';
import AboutModal from './components/AboutModal';
import { sendMessageToHealthFlow } from './services/geminiService';
import { Menu, Moon, Sun, Share2, WifiOff, HelpCircle } from 'lucide-react';
import { GoogleHealthLogo } from './components/GoogleHealthLogo';

const App: React.FC = () => {
  // --- State ---
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    // Load from local storage
    try {
      const saved = localStorage.getItem('clarity_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed
  const [isTyping, setIsTyping] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Derived ---
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('clarity_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Online/Offline Status Listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping, currentSessionId]);

  // --- Helpers ---
  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const createNewSession = (firstMessageText: string) => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: firstMessageText.length > 30 ? firstMessageText.slice(0, 30) + '...' : firstMessageText,
      messages: [],
      priceDataMap: {},
      createdAt: new Date().toISOString()
    };
    return newSession;
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // --- Handlers ---
  const handleNewChat = () => {
    setCurrentSessionId(null);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  const handleSendMessage = async (text: string, file: File | null = null) => {
    if (!isOnline && !text) return;

    let activeSessionId = currentSessionId;
    let newSessionCreated = false;
    let attachmentDataUrl: string | undefined = undefined;
    let attachmentForApi: { mimeType: string, data: string } | null = null;

    if (file) {
      try {
        attachmentDataUrl = await fileToDataURL(file);
        // Extract base64 data for API (remove "data:image/png;base64,")
        const [meta, data] = attachmentDataUrl.split(',');
        const mimeType = meta.split(':')[1].split(';')[0];
        attachmentForApi = { mimeType, data };
      } catch (e) {
        console.error("File processing error", e);
      }
    }

    // Create session if needed
    if (!activeSessionId) {
      const title = file ? `Analysis: ${file.name}` : text;
      const newSession = createNewSession(title);
      setSessions(prev => [newSession, ...prev]);
      activeSessionId = newSession.id;
      setCurrentSessionId(activeSessionId);
      newSessionCreated = true;
    }

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: Sender.USER,
      timestamp: new Date(),
      attachmentUrl: attachmentDataUrl
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [...s.messages, userMsg] };
      }
      return s;
    }));

    setIsTyping(true);

    try {
      // Prepare history
      const prevMessages = newSessionCreated ? [] : (sessions.find(s => s.id === activeSessionId)?.messages || []);
      
      const currentHistory = prevMessages.map(m => {
        // Construct history parts
        const parts: any[] = [];
        if (m.text) parts.push({ text: m.text });
        
        return {
          role: m.sender === Sender.USER ? 'user' : 'model',
          parts: parts
        };
      });

      // Call API
      const response = await sendMessageToHealthFlow(text, currentHistory, attachmentForApi);
      
      // -- AdMob / Native Ad Integration Logic --
      // If we have providers, mix in a "Native Ad"
      let providers = response.providers || [];
      if (providers.length > 0) {
          const ad: Provider = {
              name: "Sponsored Result",
              address: "Ad",
              isAd: true // Flag to render as Ad component
          };
          // Insert ad at 2nd position (index 1) if possible
          if (providers.length >= 1) {
              providers.splice(1, 0, ad);
          } else {
              providers.push(ad);
          }
      }

      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMsgId,
        text: response.conversationalResponse,
        sender: Sender.AI,
        timestamp: new Date(),
        suggestedPrompts: response.suggestedPrompts,
        providers: providers
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          const updatedPriceMap = response.isMedicalQuery && response.data 
            ? { ...s.priceDataMap, [aiMsgId]: response.data }
            : s.priceDataMap;
          
          return {
            ...s,
            messages: [...s.messages, aiMsg],
            priceDataMap: updatedPriceMap
          };
        }
        return s;
      }));

    } catch (error) {
      console.error("Error", error);
      // Fallback Error Message for UI
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble connecting right now. Please check your connection or try again in a moment.",
        sender: Sender.AI,
        timestamp: new Date()
      };
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, errorMsg] };
        }
        return s;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (text: string) => {
    handleSendMessage(text);
  };

  // --- Render ---

  // Common Header
  const Header = () => (
    <header className="flex-shrink-0 h-16 bg-white/80 dark:bg-google-dark-bg/80 backdrop-blur-md border-b border-gray-100 dark:border-google-dark-border flex items-center px-4 md:px-6 justify-between sticky top-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-3 overflow-hidden">
         <button 
           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
           className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-google-dark-surface rounded-full transition-colors flex-shrink-0"
         >
           <Menu size={20} />
         </button>
         
         <div className="flex items-center gap-2 cursor-pointer flex-shrink-0 min-w-0" onClick={handleNewChat}>
           <GoogleHealthLogo className="flex-shrink-0" />
           <div className="flex items-center gap-1.5 truncate">
             <span className="text-base md:text-xl font-medium tracking-tight">
               <span className="text-google-blue">H</span>
               <span className="text-google-red">e</span>
               <span className="text-google-yellow">a</span>
               <span className="text-google-blue">l</span>
               <span className="text-google-green">t</span>
               <span className="text-google-red">h</span>
             </span>
             <span className="text-base md:text-xl font-medium text-gray-600 dark:text-gray-200 tracking-tight">Clarity</span>
           </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
         {currentSessionId && (
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-google-dark-surface rounded-full transition-colors hidden sm:block"
              title="Share chat"
            >
              <Share2 size={20} />
            </button>
         )}
         
         {/* About Button */}
         <button 
           onClick={() => setIsAboutModalOpen(true)}
           className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-google-dark-surface rounded-full transition-colors"
           title="About Health Clarity"
         >
           <HelpCircle size={20} />
         </button>

         <button 
           onClick={toggleTheme}
           className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-google-dark-surface rounded-full transition-colors"
           title={theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
         >
           {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
         </button>
         <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-medium ml-1 flex-shrink-0">
           K
         </div>
      </div>
    </header>
  );

  return (
    <div className="h-screen w-full bg-gray-100 dark:bg-google-dark-bg flex overflow-hidden transition-colors duration-300 relative">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="absolute top-16 left-0 right-0 bg-gray-800 dark:bg-gray-700 text-white text-xs py-1 px-4 text-center z-20 flex items-center justify-center gap-2">
           <WifiOff size={12} />
           <span>You are offline. Chat history is available, but new searches require a connection.</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        toggleSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        <Header />

        {/* View: Intro (Home) */}
        {!currentSessionId && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto w-full">
            <div className="text-center w-full max-w-2xl space-y-8 animate-fade-in pb-10">
              <div className="flex flex-col items-center gap-4 px-4">
                 <GoogleHealthLogo size={64} />
                 <h1 className="text-3xl md:text-5xl font-medium tracking-tight flex items-center justify-center gap-3">
                   <span>
                     <span className="text-google-blue">H</span>
                     <span className="text-google-red">e</span>
                     <span className="text-google-yellow">a</span>
                     <span className="text-google-blue">l</span>
                     <span className="text-google-green">t</span>
                     <span className="text-google-red">h</span>
                   </span>
                   <span className="text-gray-700 dark:text-gray-200">Clarity</span>
                 </h1>
                 <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light max-w-lg mx-auto leading-relaxed">
                   Democratizing healthcare transparency. Ask about fair prices, codes, or upload a bill to analyze.
                 </p>
              </div>

              {/* Example Prompts - Horizontal Scroll on Mobile */}
              <div className="flex md:grid md:grid-cols-2 gap-3 w-full max-w-xl mx-auto mt-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 px-4 md:px-0 -mx-4 md:mx-auto no-scrollbar snap-x snap-mandatory">
                <button 
                  onClick={() => handleSendMessage("Check the price for Lipitor NDC 00071-0155-23")}
                  disabled={!isOnline}
                  className="min-w-[260px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl border border-gray-200 dark:border-google-dark-border hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all text-left group bg-white dark:bg-google-dark-surface shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="block text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-google-blue">"Lipitor NDC 00071-0155-23"</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Check medication List Price & Cash estimate</span>
                </button>
                <button 
                  onClick={() => handleSendMessage("Analyze this bill for fairness", null)}
                  disabled={!isOnline}
                  className="min-w-[260px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl border border-gray-200 dark:border-google-dark-border hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all text-left group bg-white dark:bg-google-dark-surface shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <span className="block text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-google-blue">"Analyze my medical bill"</span>
                   <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Upload a photo to detect codes & charges</span>
                </button>
                <button 
                  onClick={() => handleSendMessage("What is the fair price for a Brain MRI without contrast?")}
                  disabled={!isOnline}
                  className="min-w-[260px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl border border-gray-200 dark:border-google-dark-border hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all text-left group bg-white dark:bg-google-dark-surface shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <span className="block text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-google-blue">"Price of Brain MRI?"</span>
                   <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Compare hospital vs outpatient centers</span>
                </button>
                <button 
                   onClick={() => handleSendMessage("Look up CPT code 99213")}
                   disabled={!isOnline}
                   className="min-w-[260px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl border border-gray-200 dark:border-google-dark-border hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all text-left group bg-white dark:bg-google-dark-surface shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <span className="block text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-google-blue">"Check Code 99213"</span>
                   <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Standard office visit (15 min) rates</span>
                </button>
                <button 
                   onClick={() => handleSendMessage("How much does a Level 3 ER visit (99283) cost?")}
                   disabled={!isOnline}
                   className="min-w-[260px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl border border-gray-200 dark:border-google-dark-border hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all text-left group bg-white dark:bg-google-dark-surface shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <span className="block text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-google-blue">"ER Visit Cost"</span>
                   <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Emergency Department pricing levels</span>
                </button>
                <button 
                   onClick={() => handleSendMessage("What is diagnosis code M54.5?")}
                   disabled={!isOnline}
                   className="min-w-[260px] md:min-w-0 flex-shrink-0 snap-center p-4 rounded-xl border border-gray-200 dark:border-google-dark-border hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all text-left group bg-white dark:bg-google-dark-surface shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   <span className="block text-sm font-medium text-gray-900 dark:text-gray-200 group-hover:text-google-blue">"Check Diagnosis M54.5"</span>
                   <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Low back pain code & treatments</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View: Chat */}
        {currentSessionId && (
          <main className="flex-1 overflow-y-auto scroll-smooth w-full">
            <div className="max-w-3xl mx-auto px-4 pt-4 pb-4">
              {messages.map((msg) => (
                <ChatMessage 
                  key={msg.id} 
                  message={{
                    ...msg,
                    timestamp: new Date(msg.timestamp) // Rehydrate date from string if loaded from localstorage
                  }}
                  priceData={currentSession?.priceDataMap[msg.id]}
                  onCodeClick={handlePromptClick}
                  onPromptClick={handlePromptClick}
                />
              ))}
              
              {isTyping && (
                 <ChatMessage 
                   message={{
                     id: 'thinking',
                     text: '',
                     sender: Sender.AI,
                     timestamp: new Date(),
                     isThinking: true
                   }}
                 />
              )}
              <div ref={messagesEndRef} />
            </div>
          </main>
        )}

        {/* Footer Input */}
        <footer className="flex-shrink-0 bg-white dark:bg-google-dark-bg border-t border-gray-100/50 dark:border-google-dark-border transition-colors duration-300">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} isOffline={!isOnline} />
        </footer>
      </div>

      {/* Modals */}
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        session={currentSession || null}
      />
      
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
};

export default App;