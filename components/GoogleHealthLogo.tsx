import React from 'react';

export const GoogleHealthLogo = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Staff - Blue */}
    <path d="M12 3V21" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
    
    {/* Wings - Red */}
    <path d="M5 6.5C5 6.5 8 9 12 9C16 9 19 6.5 19 6.5" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Snake 1 - Green (Left Lower Loop, Right Upper Loop) */}
    <path d="M12 21C10 21 8.5 19 8.5 17C8.5 15 12 14.5 12 14.5C12 14.5 15.5 13.5 15.5 11.5C15.5 9.5 13 8.5 12 8.5" stroke="#34A853" strokeWidth="2" strokeLinecap="round" />
    
    {/* Snake 2 - Yellow (Right Lower Loop, Left Upper Loop) */}
    <path d="M12 21C14 21 15.5 19 15.5 17C15.5 15 12 14.5 12 14.5C12 14.5 8.5 13.5 8.5 11.5C8.5 9.5 11 8.5 12 8.5" stroke="#FBBC04" strokeWidth="2" strokeLinecap="round" />
    
    {/* Top Ball - Blue */}
    <circle cx="12" cy="3" r="1.5" fill="#4285F4" />
  </svg>
);
