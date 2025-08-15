// components/layout/page-transition.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [currentContent, setCurrentContent] = useState(children);
  const [isMounted, setIsMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousPathnameRef = useRef(pathname);

  // Opacity fade only - no movement
  const handleTransition = () => {
    if (!isMounted || !contentRef.current) return;
    
    setIsTransitioning(true);
    
    // Fade out only - no movement at all
    contentRef.current.style.opacity = '0.94';
    
    // Update content after short delay
    setTimeout(() => {
      setCurrentContent(children);
      
      // Fade back in
      if (contentRef.current) {
        contentRef.current.style.opacity = '1';
      }
      
      // Reset transition state
      setTimeout(() => {
        setIsTransitioning(false);
      }, 80);
    }, 60);
  };

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
    setCurrentContent(children);
    previousPathnameRef.current = pathname;
  }, []);

  useEffect(() => {
    // Don't animate on initial render or if not mounted
    if (!isMounted) {
      setCurrentContent(children);
      return;
    }

    // Don't animate if path hasn't changed
    if (previousPathnameRef.current === pathname) {
      setCurrentContent(children);
      return;
    }

    if (isTransitioning) return;

    // Only animate for main navigation routes
    const mainRoutes = ['/dashboard', '/transactions', '/budget', '/analytics'];
    if (mainRoutes.includes(pathname) && mainRoutes.includes(previousPathnameRef.current)) {
      handleTransition();
    } else {
      // No animation for other routes
      setCurrentContent(children);
    }

    previousPathnameRef.current = pathname;
  }, [pathname, children, isTransitioning, isMounted]);

  // Don't render transition wrapper until mounted to prevent hydration issues
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={contentRef}
      className="min-h-screen"
      style={{ 
        transition: 'opacity 100ms ease-out'
      }}
    >
      {currentContent}
    </div>
  );
}
