// components/ui/Progress.tsx

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  style?: ViewStyle;
  color?: string;
  height?: number;
}

export function Progress({ 
  value, 
  className, 
  style, 
  color = '#ed7105',
  height = 8 
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View 
      className={cn('bg-muted rounded-full overflow-hidden', className)}
      style={[{ height }, style]}
    >
      <View
        className="rounded-full transition-all duration-300"
        style={{
          width: `${clampedValue}%`,
          height: '100%',
          backgroundColor: color,
        }}
      />
    </View>
  );
}
