// components/ui/Card.tsx

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, className, style }: CardProps) {
  return (
    <View 
      className={cn('bg-card rounded-lg p-4 shadow-sm border border-border', className)}
      style={style}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className, style }: CardProps) {
  return (
    <View 
      className={cn('pb-2', className)}
      style={style}
    >
      {children}
    </View>
  );
}

export function CardContent({ children, className, style }: CardProps) {
  return (
    <View 
      className={cn('pt-2', className)}
      style={style}
    >
      {children}
    </View>
  );
}

export function CardTitle({ children, className, style }: CardProps) {
  return (
    <View 
      className={cn('', className)}
      style={style}
    >
      {children}
    </View>
  );
}
