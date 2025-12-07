
import React from 'react';
import { MessageSquare, Plus, Trash2, History, X } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat,
  onDeleteSession,
  toggleSidebar
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 dark:bg-black/50 z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />
      
      {/* Sidebar Content */}
      <div className={`
        fixed md:relative z-30 h-full bg-white dark:bg-google-dark-surface border-r border-gray-200 dark:border-google-dark-border w-[260px] flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:border-none md:translate-x-0 md:overflow-hidden'}
      `}>
        {/* Header / New Chat */}
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between md:hidden mb-4">
            <span className="font-medium text-gray-600 dark:text-gray-300">Menu</span>
            <button onClick={toggleSidebar} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <button 
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#f0f2f5] dark:bg-[#334155] hover:bg-[#e1e4e8] dark:hover:bg-[#475569] text-gray-700 dark:text-gray-100 rounded-full transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            <span className="text-gray-700 dark:text-gray-100">New chat</span>
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2 mt-2">Recent</div>
          <div className="space-y-1">
            {sessions.length === 0 ? (
               <div className="px-4 py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                 <History size={24} className="mx-auto mb-2 opacity-50" />
                 No recent chats
               </div>
            ) : (
              sessions.map(session => (
                <div 
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`
                    group flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer text-sm transition-colors
                    ${currentSessionId === session.id 
                      ? 'bg-[#e7f1ff] dark:bg-[#0f172a] text-[#001d35] dark:text-[#c2e7ff]' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                  `}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="truncate flex-1">{session.title}</span>
                  <button 
                    onClick={(e) => onDeleteSession(e, session.id)}
                    className={`
                      p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700
                      opacity-0 group-hover:opacity-100 transition-opacity
                    `}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;