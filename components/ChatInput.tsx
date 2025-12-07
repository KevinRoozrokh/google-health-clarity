
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Plus, Sparkles, X, FileText, Image as ImageIcon, WifiOff, Loader2, Square } from 'lucide-react';
import { transcribeAudio } from '../services/geminiService';

interface ChatInputProps {
  onSend: (text: string, file: File | null) => void;
  disabled: boolean;
  isOffline?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled, isOffline }) => {
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || selectedFile) && !disabled && !isOffline) {
      onSend(input, selectedFile);
      setInput('');
      setSelectedFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (!isOffline) {
      fileInputRef.current?.click();
    }
  };

  // Helper to get supported MIME type
  const getSupportedMimeType = () => {
    const types = [
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
      'audio/wav',
      'audio/aac'
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return ''; // Let browser decide default
  };

  // Audio Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Use the actual mime type of the recorder or fallback
        const type = mediaRecorder.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type });
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
        
        await handleAudioProcessing(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please ensure you have granted permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioProcessing = async (audioBlob: Blob) => {
    setIsProcessingAudio(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        // Split to get just data; assuming standard data URL format (e.g., data:audio/webm;base64,...)
        const base64Data = base64Audio.split(',')[1]; 
        
        try {
            const transcript = await transcribeAudio(base64Data, audioBlob.type);
            if (transcript) {
                setInput(prev => (prev ? prev + ' ' + transcript : transcript));
            }
        } catch (err) {
            console.error("Transcription failed", err);
        } finally {
            setIsProcessingAudio(false);
        }
      };
    } catch (e) {
      console.error("Error processing audio", e);
      setIsProcessingAudio(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const isDisabled = disabled || isOffline;
  const isMicDisabled = isDisabled || isProcessingAudio;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
      <div className={`
        group relative bg-gray-100 dark:bg-google-dark-surface rounded-[28px] 
        ${!isDisabled ? 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-[#28292a] hover:border-gray-200 dark:hover:border-gray-600 focus-within:bg-white dark:focus-within:bg-[#28292a] focus-within:shadow-md focus-within:border-gray-200 dark:focus-within:border-gray-600' : 'opacity-70 cursor-not-allowed'}
        transition-all duration-200 border border-transparent 
        ${selectedFile ? 'rounded-2xl' : ''}
      `}>
        
        {/* File Preview Area */}
        {selectedFile && (
          <div className="px-4 pt-3 pb-1 flex items-center gap-3 animate-fade-in border-b border-gray-200/50 dark:border-gray-700/50 mx-2 mb-1">
            <div className="relative group/file">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800">
                {selectedFile.type.startsWith('image/') ? (
                  <ImageIcon size={20} className="text-blue-600 dark:text-blue-400" />
                ) : (
                  <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                disabled={isDisabled}
                className="absolute -top-2 -right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full p-0.5 shadow-sm transition-colors disabled:opacity-50"
              >
                <X size={12} />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          accept="image/*,application/pdf"
          className="hidden" 
          disabled={isDisabled}
        />

        {/* Input Row Container - Flexbox */}
        <div className="flex items-end gap-2 p-2 pl-3">
           {/* Left Action: Upload */}
           <button 
             onClick={triggerFileSelect}
             disabled={isDisabled}
             className="p-2 mb-0.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
             title="Upload medical bill or document"
           >
             <Plus size={20} />
           </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled || isRecording}
            placeholder={
              isOffline ? "You are offline." : 
              isRecording ? "Listening..." :
              isProcessingAudio ? "Transcribing..." :
              selectedFile ? "Ask about this document..." : 
              "Ask about prices, codes, or bills..."
            }
            className={`flex-1 bg-transparent border-0 focus:ring-0 resize-none py-3 px-0 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 max-h-[150px] overflow-y-auto no-scrollbar min-h-[44px] leading-relaxed ${isDisabled ? 'cursor-not-allowed text-gray-400 dark:text-gray-500' : ''}`}
            rows={1}
            style={{ minHeight: '44px' }}
          />

          {/* Right Action: Send/Mic */}
          <div className="flex items-center gap-1 mb-0.5 flex-shrink-0">
            {input.trim().length > 0 || selectedFile ? (
              <button 
                onClick={() => handleSubmit()}
                disabled={isDisabled}
                className="p-2 bg-google-blue text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                <Send size={18} />
              </button>
            ) : (
              <button 
                onClick={toggleRecording}
                className={`p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                disabled={isMicDisabled}
                title="Speak to type"
              >
                {isOffline ? <WifiOff size={20} /> : 
                 isProcessingAudio ? <Loader2 size={20} className="animate-spin" /> :
                 isRecording ? <Square size={18} fill="currentColor" /> :
                 <Mic size={20} />
                }
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-3">
         <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5">
           Prices are estimates based on public data (CMS, NLM). Uploaded bills are analyzed by AI for educational purposes only.
         </p>
         <div className="flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Sparkles size={12} className="text-google-blue" />
            <span className="text-[11px] font-medium flex items-center gap-1">
              Powered by 
              <span>
                <span className="text-google-blue">G</span>
                <span className="text-google-red">o</span>
                <span className="text-google-yellow">o</span>
                <span className="text-google-blue">g</span>
                <span className="text-google-green">l</span>
                <span className="text-google-red">e</span>
              </span>
              Gemini
            </span>
         </div>
      </div>
    </div>
  );
};

export default ChatInput;
