
import React, { useState } from 'react';
import { PriceData } from '../types';
import { ShieldCheck, Info, TrendingUp, Building2, Copy, Check, Search, ArrowUpDown, Stethoscope, Banknote, Tag, Activity, ArrowRight, Pill } from 'lucide-react';

interface PriceCardProps {
  data: PriceData;
  onCodeClick?: (code: string) => void;
}

const CarrierLogo = ({ name }: { name: string }) => {
  const [error, setError] = useState(false);

  // Map common names to domains for better logo matching
  const domainMap: Record<string, string> = {
    'UnitedHealthcare': 'uhc.com',
    'Blue Cross': 'bcbs.com',
    'Blue Cross Blue Shield': 'bcbs.com',
    'Aetna': 'aetna.com',
    'Cigna': 'cigna.com',
    'Humana': 'humana.com',
    'Kaiser Permanente': 'kp.org',
    'Anthem': 'anthem.com',
    'Molina Healthcare': 'molinahealthcare.com',
    'Centene': 'centene.com',
    'Fidelis Care': 'fideliscare.org'
  };

  const domain = domainMap[name];

  if (!domain || error) {
    return <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>;
  }

  return (
    <div className="flex items-center gap-2" title={name}>
      <img 
        src={`https://logo.clearbit.com/${domain}?size=60`} 
        alt={name}
        className="h-5 w-auto object-contain max-w-[24px] opacity-90 hover:opacity-100 transition-opacity"
        onError={() => setError(true)}
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
    </div>
  );
};

const PriceCard: React.FC<PriceCardProps> = ({ data, onCodeClick }) => {
  const [copied, setCopied] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsePrice = (price: string) => {
    // Remove non-numeric characters (except decimal point) to parse currency string
    return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
  };

  const sortedCarriers = data.carriers ? [...data.carriers].sort((a, b) => {
    const priceA = parsePrice(a.price);
    const priceB = parsePrice(b.price);
    return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
  }) : [];

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const isDiagnosis = data.type === 'diagnosis';
  const isDrug = data.type === 'drug';

  // Helper for clickable tooltips (useful for mobile)
  const showInfo = (title: string, message: string) => {
    // Using a simple alert for MVP reliability across devices
    alert(`${title}\n\n${message}`);
  };

  return (
    <div className="mt-4 bg-white dark:bg-google-dark-surface rounded-xl border border-gray-200 dark:border-google-dark-border shadow-sm overflow-hidden animate-fade-in transition-colors">
      {/* Header */}
      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 border-b border-blue-100 dark:border-blue-900/30">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border 
                 ${isDiagnosis 
                    ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' 
                    : isDrug 
                        ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
                        : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800'
                  }`}>
                 {isDiagnosis ? 'Diagnosis' : isDrug ? 'Medication' : 'Procedure'}
               </span>
               <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <ShieldCheck size={12} className="text-green-600 dark:text-green-400" />
                  Verified
               </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-snug">{data.procedureName}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span 
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group select-none border border-gray-200 dark:border-gray-700"
                title="Click to copy code to clipboard"
              >
                {isDrug ? 'NDC' : 'Code'}: {data.code}
                {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="opacity-50 group-hover:opacity-100" />}
              </span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 flex gap-2 leading-relaxed">
          <Info size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          {data.description}
        </p>
        
        {/* Common Reasons / Uses */}
        {!isDiagnosis && data.commonReasons && data.commonReasons.length > 0 && (
          <div className="mt-2.5 flex gap-2 items-start">
            {isDrug ? (
                <Pill size={16} className="text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            ) : (
                <Stethoscope size={16} className="text-purple-500 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-700 dark:text-gray-200">
                  {isDrug ? 'Common Uses: ' : 'Common Reasons: '}
              </span>
              {data.commonReasons.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Pricing Data Grid - HIDDEN FOR DIAGNOSIS */}
      {!isDiagnosis && (
        <div className="p-4 grid gap-6 md:grid-cols-2">
          {/* Baseline & Range */}
          <div className="space-y-4">
            
            {/* Gross Charge (Highest Price / AWP) */}
            {data.grossCharge && (
              <div 
                className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100 dark:border-red-900/30 group cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                title={isDrug ? "Average Wholesale Price (AWP) or List Price." : "The provider's sticker price before any insurance discounts."}
                onClick={() => showInfo(isDrug ? 'List Price (AWP)' : 'Gross Charge', isDrug ? 'The Average Wholesale Price (AWP) or manufacturer list price. This is rarely what consumers pay.' : 'The provider\'s sticker price before any insurance discounts. This is essentially the MSRP and is rarely paid in full by patients with insurance.')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Tag size={14} className="text-red-500 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">{isDrug ? 'List Price' : 'Gross Charge'}</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data.grossCharge}</div>
                <div className="text-xs text-red-700 dark:text-red-400 mt-1">{isDrug ? 'Avg. Wholesale Price' : 'Sticker price (Chargemaster)'}</div>
              </div>
            )}

            {(data.commercialRange || data.medicareBaseline) && (
              <div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Fair Price Range</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.commercialRange || 'N/A'}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Market Rate</span>
                </div>
              </div>
            )}

            {/* Cash Pay Estimate */}
            {data.cashPayEstimate && (
              <div 
                className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-100 dark:border-green-900/30 group cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                title={isDrug ? "Estimated price with discount cards (e.g. GoodRx)." : "An estimate for self-pay patients, typically lower than the gross charge."}
                onClick={() => showInfo(isDrug ? 'Discount Card Price' : 'Estimated Cash Price', isDrug ? 'Estimated cash price when using pharmacy discount cards or coupons (like GoodRx).' : 'An estimated rate for self-pay (uninsured) patients. This is often negotiated down from the Gross Charge.')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Banknote size={14} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">{isDrug ? 'Discount Cash Price' : 'Estimated Cash Price'}</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data.cashPayEstimate}</div>
                <div className="text-xs text-green-700 dark:text-green-400 mt-1">{isDrug ? 'w/ Discount Card' : 'Self-pay / Uninsured rate'}</div>
              </div>
            )}
            
            {data.medicareBaseline && (
              <div 
                className="bg-gray-50 dark:bg-[#1a1b1e] rounded-lg p-3 border border-gray-100 dark:border-gray-700 group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="The standardized rate the government pays for this service."
                onClick={() => showInfo('Medicare Baseline', isDrug ? 'The National Average Drug Acquisition Cost (NADAC) or government baseline pricing.' : 'The standardized rate the government (Medicare) pays for this service. Private insurance rates are often based on a multiplier of this baseline.')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={14} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{isDrug ? 'NADAC / Baseline' : 'Medicare Baseline'}</span>
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{data.medicareBaseline}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{isDrug ? 'Gov. Acquisition Cost' : 'Government reimb. rate'}</div>
              </div>
            )}
          </div>

          {/* Carrier Breakdown */}
          {sortedCarriers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={14} />
                  {isDrug ? 'Payer / Plan Estimates' : 'Carrier Estimates'}
                </div>
                <button 
                  onClick={toggleSort}
                  className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded transition-colors"
                  title="Sort by price"
                >
                  <ArrowUpDown size={12} />
                  {sortOrder === 'asc' ? 'Low → High' : 'High → Low'}
                </button>
              </div>
              
              <div className="space-y-[1px]">
                {sortedCarriers.map((carrier, idx) => (
                  <div key={idx} className="flex justify-between items-center px-2 py-[3px] rounded hover:bg-gray-50 dark:hover:bg-[#1a1b1e] transition-colors">
                    <CarrierLogo name={carrier.name} />
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{carrier.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[10px] text-gray-400 dark:text-gray-500 text-right">
                {isDrug ? '*Est. insurance co-pay/coverage.' : '*Est. negotiated rates. Varies by plan & facility.'}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Similar Codes / Treatments / Alternatives Section */}
      {data.similarCodes && data.similarCodes.length > 0 && (
        <div className="bg-gray-50 dark:bg-[#1a1b1e] border-t border-gray-100 dark:border-google-dark-border p-4">
          <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Search size={12} />
            {isDiagnosis ? 'Common Treatments & Procedures' : isDrug ? 'Generic & Therapeutic Alternatives' : 'Related Procedures'}
          </div>
          
          {/* Scrollable Container */}
          <div className={`flex gap-3 overflow-x-auto no-scrollbar pb-2 ${isDiagnosis ? 'flex-nowrap' : ''}`}>
            {data.similarCodes.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onCodeClick && onCodeClick(item.code)}
                className={`
                  flex-shrink-0 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm bg-white dark:bg-google-dark-surface group relative
                  ${isDiagnosis ? 'min-w-[280px] max-w-[320px] p-4 flex flex-col gap-2 h-auto' : 'px-3 py-1.5 flex items-center gap-1.5 rounded-full'}
                `}
                title={`Check pricing for ${item.label}`}
              >
                 {isDiagnosis ? (
                   <>
                     <div className="flex items-center justify-between w-full">
                       <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{item.code}</span>
                       <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">Procedure</span>
                     </div>
                     <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200" title={item.label}>{item.label}</h4>
                     {item.summary && (
                       <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.summary}</p>
                     )}
                     <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center text-blue-600 dark:text-blue-400 text-xs font-medium gap-1 group-hover:gap-2 transition-all">
                       Check Pricing <ArrowRight size={12} />
                     </div>
                   </>
                 ) : (
                   <>
                     <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs">{item.code}</span>
                     <span className="text-gray-600 dark:text-gray-400 text-xs opacity-80 truncate max-w-[150px]">{item.label}</span>
                   </>
                 )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCard;