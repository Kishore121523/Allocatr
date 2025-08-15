// components/ui/Badge.tsx

import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({ 
  children, 
  variant = 'default', 
  className, 
  style, 
  textStyle 
}: BadgeProps) {
  const baseStyles = 'px-2 py-1 rounded-full';
  
  const variants = {
    default: 'bg-primary',
    secondary: 'bg-secondary',
    destructive: 'bg-destructive',
    outline: 'border border-border bg-transparent',
  };

  const textVariants = {
    default: 'text-primary-foreground text-xs font-medium',
    secondary: 'text-secondary-foreground text-xs font-medium',
    destructive: 'text-destructive-foreground text-xs font-medium',
    outline: 'text-foreground text-xs font-medium',
  };

  return (
    <View 
      className={cn(baseStyles, variants[variant], className)}
      style={style}
    >
      <Text 
        className={textVariants[variant]}
        style={textStyle}
      >
        {children}
      </Text>
    </View>
  );
}
