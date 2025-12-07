
import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

const NativeAd: React.FC = () => {
  return (
    <div className="bg-orange-50/40 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 p-3 rounded-xl shadow-sm hover:shadow-md transition-all relative group cursor-pointer">
      <div className="absolute top-0 right-0 bg-gray-100 dark:bg-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg rounded-tr-xl text-gray-500 dark:text-gray-400">
        Ad
      </div>
      <div className="flex gap-3">
         {/* Ad Icon / Logo Placeholder */}
         <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-700 shadow-sm">
            <span className="font-bold text-google-blue text-xs">G</span>
         </div>
         
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-1.5 mb-0.5">
             <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
               Compare Health Plans
             </h4>
             <Info size={10} className="text-gray-400" />
           </div>
           <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
             Find affordable coverage options in your area. Lower your medical bills today.
           </p>
           <div className="mt-2 flex items-center text-[10px] font-medium text-blue-600 dark:text-blue-400">
             Open <ExternalLink size={10} className="ml-1" />
           </div>
         </div>
      </div>
    </div>
  );
};

export default NativeAd;
