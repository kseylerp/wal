import { useState, useEffect } from 'react';

export function useIsMobile(breakpoint: number = 640) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Initial check
    checkSize();
    
    // Add event listener
    window.addEventListener('resize', checkSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkSize);
  }, [breakpoint]);
  
  return isMobile;
}