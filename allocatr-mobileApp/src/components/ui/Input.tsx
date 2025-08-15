// components/ui/Input.tsx

import React from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle } from 'react-native';
import { cn } from '../../lib/utils';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
  containerStyle?: ViewStyle;
}

export function Input({ 
  label, 
  error, 
  className, 
  containerStyle, 
  ...props 
}: InputProps) {
  return (
    <View style={containerStyle}>
      {label && (
        <Text className="text-sm font-medium text-foreground mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          'border border-border rounded-md px-3 py-3 bg-background text-foreground',
          'focus:border-ring focus:ring-2 focus:ring-ring/20',
          error && 'border-destructive',
          className
        )}
        placeholderTextColor="#6b6880"
        {...props}
      />
      {error && (
        <Text className="text-sm text-destructive mt-1">
          {error}
        </Text>
      )}
    </View>
  );
}
