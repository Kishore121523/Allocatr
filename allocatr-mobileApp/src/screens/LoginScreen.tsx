// screens/LoginScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../providers/auth-provider';
import { Button } from '../components/ui/Button';

export default function LoginScreen() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f7fa" />
      
      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <View style={styles.content}>
        {/* Logo and Brand */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Ionicons name="wallet" size={32} color="#ed7105" />
          </View>
          <Text style={styles.brandName}>Allocatr</Text>
          <Text style={styles.tagline}>Smart budgeting, simplified</Text>
        </View>

        {/* Sign In Button */}
        <View style={styles.signInContainer}>
          <Button
            onPress={signInWithGoogle}
            loading={loading}
            className="w-full h-12 bg-primary"
            style={styles.signInButton}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="logo-google" size={20} color="#f8f7fa" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </View>
          </Button>
          
          <Text style={styles.disclaimer}>
            Your data is encrypted and secure. We never share your financial information.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
            <Text style={styles.featureText}>Privacy-first design</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="analytics" size={20} color="#3b82f6" />
            <Text style={styles.featureText}>AI-powered categorization</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="trending-up" size={20} color="#8b5cf6" />
            <Text style={styles.featureText}>Zero-based budgeting</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fa',
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(237, 113, 5, 0.05)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: '30%',
    left: -50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(237, 113, 5, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '600',
    color: '#3d3c4f',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6b6880',
  },
  signInContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  signInButton: {
    borderRadius: 12,
    shadowColor: '#ed7105',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#f8f7fa',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6b6880',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  featuresContainer: {
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#6b6880',
    marginLeft: 12,
  },
});
