
import React, { useState } from 'react';
import { X, Copy, Check, Mail, MessageSquare, Twitter, Facebook } from 'lucide-react';
import { ChatSession } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, session }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !session) return null;

  // Helper to extract the last meaningful pricing info
  const getSummary = () => {
    const title = session.title;
    let priceInfo = "";
    
    // Try to find the last price data
    const priceDataIds = Object.keys(session.priceDataMap);
    if (priceDataIds.length > 0) {
      const lastData = session.priceDataMap[priceDataIds[priceDataIds.length - 1]];
      priceInfo = ` - Estimated: ${lastData.commercialRange}`;
    }

    return `Health Clarity Check: ${title}${priceInfo}. Check fair prices here!`;
  };

  const shareText = getSummary();
  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${currentUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    let url = '';
    const text = encodeURIComponent(shareText);
    const link = encodeURIComponent(currentUrl);

    switch (platform) {
      case 'gmail':
        url = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent("Medical Price Check")}&body=${text}%0A%0A${link}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${link}`;
        break;
      case 'sms':
        url = `sms:?body=${text} ${link}`;
        break;
    }

    if (url) window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-google-dark-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up border border-gray-100 dark:border-google-dark-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-google-dark-border flex items-center justify-between bg-gray-50 dark:bg-[#0f172a]">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Share Chat</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Preview */}
          <div className="bg-gray-50 dark:bg-[#0f172a] p-4 rounded-xl border border-gray-100 dark:border-google-dark-border">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Preview:</p>
            <p className="text-gray-800 dark:text-gray-200 italic">"{shareText}"</p>
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-4 gap-4">
            <button 
              onClick={() => handleShare('gmail')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Gmail</span>
            </button>

            <button 
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Twitter size={24} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">X / Twitter</span>
            </button>

            <button 
              onClick={() => handleShare('facebook')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Facebook size={24} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Facebook</span>
            </button>

            <button 
              onClick={() => handleShare('sms')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Message</span>
            </button>
          </div>

          {/* Copy Link */}
          <div 
            onClick={handleCopy}
            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-colors group"
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">Or copy link</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate max-w-[200px] sm:max-w-xs">{currentUrl}</span>
            </div>
            <div className="p-2 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
              {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShareModal;