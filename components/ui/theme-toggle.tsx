'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="relative overflow-hidden"
    >
      <div className="relative h-4 w-4">
        {/* Sun Icon */}
        <Sun 
          className={`absolute h-4 w-4 transition-all duration-300 ease-in-out ${
            theme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
          }`} 
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`absolute h-4 w-4 transition-all duration-300 ease-in-out ${
            theme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
      </div>
    </Button>
  );
}
