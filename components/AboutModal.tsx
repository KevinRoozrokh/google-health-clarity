
import React from 'react';
import { X, Shield, Search, Zap, Globe, FileText, Database, Heart } from 'lucide-react';
import { GoogleHealthLogo } from './GoogleHealthLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-google-dark-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-gray-100 dark:border-google-dark-border max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-google-dark-border flex items-center justify-between bg-gray-50 dark:bg-[#1a1b1e] flex-shrink-0">
          <div className="flex items-center gap-2">
            <GoogleHealthLogo size={24} />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">About Health Clarity</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Health Clarity is an intelligent medical billing assistant designed to democratize healthcare price transparency. It empowers patients with instant access to fair price ranges, code definitions, and insurance carrier breakdowns.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3">Key Features</h4>
            
            <FeatureRow 
              icon={<Database className="text-blue-500" size={18} />}
              title="Fair Price Analysis"
              desc="Compare Commercial, Medicare, and Cash-Pay rates to know if you're being overcharged."
            />
            <FeatureRow 
              icon={<Search className="text-red-500" size={18} />}
              title="Smart Code Lookup"
              desc="Instant definitions for CPT (Procedures), HCPCS, and ICD-10 (Diagnosis) codes."
            />
            <FeatureRow 
              icon={<FileText className="text-green-500" size={18} />}
              title="Bill Scanner"
              desc="Upload photos of medical bills to automatically extract codes and detect potential errors."
            />
            <FeatureRow 
              icon={<Globe className="text-yellow-500" size={18} />}
              title="Local Provider Search"
              desc="Find highly-rated specialists and facilities in your area using Google Maps."
            />
             <FeatureRow 
              icon={<Zap className="text-purple-500" size={18} />}
              title="Offline Capable"
              desc="Access your chat history and saved price breakdowns even without an internet connection."
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30 text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Designed & Developed by
            </p>
            <a 
              href="https://kevinroozrokh.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1 hover:text-blue-600 dark:hover:text-blue-400 underline transition-all inline-block"
            >
              Kevin Roozrokh
            </a>
          </div>

          <div className="text-[10px] text-gray-400 dark:text-gray-500 text-center leading-tight">
            <p>Disclaimer: This application uses public data (CMS, NLM) and AI estimates. It does not provide medical advice or guarantee specific insurance coverage rates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
      {icon}
    </div>
    <div>
      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-200">{title}</h5>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default AboutModal;