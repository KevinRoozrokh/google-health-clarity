
import React, { useState } from 'react';
import { Message, Sender, PriceData } from '../types';
import PriceCard from './PriceCard';
import NativeAd from './NativeAd';
import { User, Sparkles, MapPin, Star, ExternalLink, Search, ArrowRight } from 'lucide-react';
import { GoogleHealthLogo } from './GoogleHealthLogo';

interface ChatMessageProps {
  message: Message;
  priceData?: PriceData | null;
  onCodeClick?: (code: string) => void;
  onPromptClick?: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, priceData, onCodeClick, onPromptClick }) => {
  const isAI = message.sender === Sender.AI;
  const [locationInput, setLocationInput] = useState('');

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim() && onPromptClick && priceData) {
      // Construct a natural language query for the AI
      const query = `Find top-rated providers for ${priceData.procedureName} in ${locationInput}`;
      onPromptClick(query);
      setLocationInput('');
    }
  };

  return (
    <div className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} mb-8 animate-slide-up`}>
      <div className={`flex max-w-3xl w-full gap-4 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAI ? 'bg-white dark:bg-google-dark-surface border border-gray-100 dark:border-google-dark-border shadow-sm' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
          {isAI ? <GoogleHealthLogo size={18} /> : <User size={18} />}
        </div>

        {/* Content */}
        <div className={`flex flex-col max-w-[90%] ${isAI ? 'items-start' : 'items-end'}`}>
          
          {/* Text Bubble */}
          <div className={`
            overflow-hidden shadow-sm flex flex-col
            ${isAI 
              ? 'bg-white dark:bg-google-dark-surface border border-gray-100 dark:border-google-dark-border text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-none' 
              : 'bg-blue-600 text-white rounded-2xl rounded-tr-none'
            }
          `}>
            
            {/* Image Attachment */}
            {message.attachmentUrl && (
              <div className="p-2 pb-0">
                <img 
                  src={message.attachmentUrl} 
                  alt="Uploaded attachment" 
                  className="max-w-full rounded-lg max-h-[300px] object-cover border border-black/10 dark:border-white/10" 
                />
              </div>
            )}

            {/* Message Text */}
            <div className={`py-2 px-4 text-[15px] leading-relaxed ${!message.text && !message.isThinking ? 'hidden' : ''}`}>
              {message.isThinking ? (
                <div className="flex items-center justify-center p-1 min-h-[24px]">
                  <GoogleHealthLogo size={20} className="animate-spin" />
                </div>
              ) : (
                message.text
              )}
            </div>
          </div>

          {/* Structured Price Card (Only for AI) */}
          {isAI && priceData && (
            <div className="w-full max-w-xl mt-3 space-y-3">
              <PriceCard data={priceData} onCodeClick={onCodeClick} />
              
              {/* Location Search Input */}
              <div className="bg-white dark:bg-google-dark-surface border border-gray-200 dark:border-google-dark-border rounded-xl p-3 shadow-sm">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-0.5">
                  Find local providers for this procedure:
                </label>
                <form onSubmit={handleLocationSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="Enter City or Zip Code..."
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-[#1a1b1e] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!locationInput.trim()}
                    className="flex items-center justify-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search size={14} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Local Providers & Native Ads (Only for AI) */}
          {isAI && message.providers && message.providers.length > 0 && (
            <div className="w-full max-w-xl mt-3 grid gap-2 sm:grid-cols-2">
               {message.providers.map((provider, idx) => (
                 provider.isAd ? (
                   <NativeAd key={idx} />
                 ) : (
                   <div key={idx} className="bg-white dark:bg-google-dark-surface border border-gray-200 dark:border-google-dark-border p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1"
                            title={provider.name}
                          >
                            {provider.name}
                          </h4>
                          <div 
                            className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400"
                            title={provider.address}
                          >
                             <MapPin size={10} />
                             <span className="truncate max-w-[150px]">{provider.address}</span>
                          </div>
                          {provider.rating && (
                            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-orange-500" title={`Rating: ${provider.rating} stars`}>
                               <Star size={10} fill="currentColor" />
                               {provider.rating}
                            </div>
                          )}
                        </div>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.name + ' ' + provider.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View on Google Maps"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                   </div>
                 )
               ))}
            </div>
          )}

          {/* Suggested Prompts (Only for AI) */}
          {isAI && message.suggestedPrompts && message.suggestedPrompts.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
              {message.suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onPromptClick && onPromptClick(prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-transparent border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-300 hover:border-blue-200 dark:hover:border-blue-800 transition-colors text-xs font-medium"
                >
                  <Sparkles size={10} className="text-google-yellow" />
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          {!message.isThinking && (
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
