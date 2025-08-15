// components/ui/Button.tsx

import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { cn } from '../../lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ 
  children, 
  onPress, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  loading = false,
  className,
  style,
  textStyle 
}: ButtonProps) {
  const baseStyles = 'rounded-md flex-row items-center justify-center';
  
  const variants = {
    default: 'bg-primary',
    destructive: 'bg-destructive',
    outline: 'border border-border bg-transparent',
    secondary: 'bg-secondary',
    ghost: 'bg-transparent',
  };

  const sizes = {
    default: 'h-12 px-4',
    sm: 'h-9 px-3',
    lg: 'h-14 px-6',
  };

  const textVariants = {
    default: 'text-primary-foreground font-medium',
    destructive: 'text-destructive-foreground font-medium',
    outline: 'text-foreground font-medium',
    secondary: 'text-secondary-foreground font-medium',
    ghost: 'text-foreground font-medium',
  };

  const textSizes = {
    default: 'text-base',
    sm: 'text-sm',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50',
        className
      )}
      style={style}
      disabled={isDisabled}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'default' ? '#f8f7fa' : '#3d3c4f'} 
          style={{ marginRight: 8 }}
        />
      )}
      <Text 
        className={cn(
          textVariants[variant],
          textSizes[size]
        )}
        style={textStyle}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
