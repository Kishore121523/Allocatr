import 'react-native-gesture-handler';
import React from 'react';
import './global.css';
import { AuthProvider } from './src/providers/auth-provider';
import { MonthProvider } from './src/providers/month-provider';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <MonthProvider>
        <AppNavigator />
      </MonthProvider>
    </AuthProvider>
  );
}