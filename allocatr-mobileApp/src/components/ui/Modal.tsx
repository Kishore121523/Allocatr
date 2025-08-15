// components/ui/Modal.tsx

import React from 'react';
import { 
  Modal as RNModal, 
  View, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ visible, onClose, children }: ModalProps) {
  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>
        
        <SafeAreaView className="bg-background rounded-t-3xl max-h-4/5">
          <StatusBar barStyle="dark-content" />
          
          <View className="flex-row justify-between items-center p-4 border-b border-border">
            <View className="w-8" />
            <View className="w-8 h-1 bg-muted rounded-full" />
            <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center">
              <Ionicons name="close" size={24} color="#6b6880" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-1">
            {children}
          </View>
        </SafeAreaView>
      </View>
    </RNModal>
  );
}
