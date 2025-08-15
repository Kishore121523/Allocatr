// components/ui/Picker.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from './Modal';
import { cn } from '../../lib/utils';

interface PickerOption {
  label: string;
  value: string;
  color?: string;
}

interface PickerProps {
  options: PickerOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function Picker({ 
  options, 
  value, 
  onSelect, 
  placeholder = "Select option", 
  label,
  className 
}: PickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      {label && (
        <Text className="text-sm font-medium text-foreground mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={cn(
          'border border-border rounded-md px-3 py-3 bg-background',
          'flex-row items-center justify-between',
          className
        )}
      >
        <View className="flex-row items-center flex-1">
          {selectedOption?.color && (
            <View 
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          <Text className={cn(
            'flex-1',
            selectedOption ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {selectedOption?.label || placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#6b6880" />
      </TouchableOpacity>

      <Modal visible={isOpen} onClose={() => setIsOpen(false)}>
        <View className="p-4">
          <Text className="text-lg font-semibold text-foreground mb-4">
            {label || 'Select Option'}
          </Text>
          
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item.value)}
                className={cn(
                  'py-3 px-4 rounded-md mb-2 flex-row items-center',
                  item.value === value ? 'bg-primary/10' : 'bg-muted/50'
                )}
              >
                {item.color && (
                  <View 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <Text className={cn(
                  'flex-1 text-base',
                  item.value === value ? 'text-primary font-medium' : 'text-foreground'
                )}>
                  {item.label}
                </Text>
                {item.value === value && (
                  <Ionicons name="checkmark" size={20} color="#ed7105" />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
}
