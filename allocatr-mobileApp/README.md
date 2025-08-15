# Allocatr Mobile App

A React Native mobile app for Allocatr, built with Expo and NativeWind.

## Features

- 🔐 Google OAuth Authentication
- 📱 Native mobile experience
- 📊 Real-time budget tracking
- 🎯 Zero-based budgeting
- 🤖 AI-powered expense categorization
- 📈 Analytics and insights
- 🌙 Dark/light theme support
- 📱 iOS and Android support

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **NativeWind** for styling (Tailwind CSS for React Native)
- **Firebase** for backend services
- **React Navigation** for navigation
- **Victory Native** for charts
- **Expo Auth Session** for Google OAuth

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy the Firebase configuration from your web app and create a `.env` file:
   ```bash
   # Firebase Configuration (copy from your web app)
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google OAuth Client ID (for mobile)
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

   # Web App API URL (for AI categorization)
   EXPO_PUBLIC_WEB_APP_API_URL=https://your-web-app-domain.com
   ```

3. **Configure Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to "Credentials" in the API & Services section
   - Create a new OAuth 2.0 Client ID for mobile applications
   - Add the client ID to your environment variables

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on device/simulator:**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web (for testing)
   npm run web
   ```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Basic UI components (Button, Card, etc.)
│   ├── dashboard/     # Dashboard-specific components
│   ├── budget/        # Budget management components
│   ├── transactions/  # Transaction components
│   └── analytics/     # Analytics components
├── screens/           # Screen components
├── navigation/        # Navigation configuration
├── hooks/            # Custom React hooks
├── providers/        # Context providers
├── lib/              # Utility functions and configurations
└── types/            # TypeScript type definitions
```

## Key Features

### Authentication
- Google OAuth integration using Expo Auth Session
- Secure token management
- User profile management

### Budget Management
- Zero-based budgeting methodology
- Category-based allocation
- Real-time spending tracking
- Budget vs actual comparison

### AI Categorization
- Automatic expense categorization
- Natural language processing
- Confidence scoring
- Manual override capability

### Analytics
- Spending trends
- Category breakdowns
- Budget performance metrics
- Monthly comparisons

### Mobile-Optimized Charts
- Victory Native for performance
- Touch interactions
- Responsive design
- Dark/light theme support

## Configuration Notes

### Firebase
- Uses the same Firebase project as the web app
- Firestore real-time listeners for data sync
- Authentication state persistence

### Styling
- NativeWind provides Tailwind CSS classes for React Native
- Consistent color scheme with web app
- Responsive design patterns
- Theme system integration

### Navigation
- Bottom tab navigation for main screens
- Stack navigation for modal flows
- Deep linking support
- Navigation state persistence

## Development

### Adding New Features
1. Create components in appropriate folders
2. Add screens to navigation
3. Implement hooks for data management
4. Add types to TypeScript definitions

### Styling Guidelines
- Use NativeWind classes for consistent styling
- Follow the design system from the web app
- Ensure accessibility with proper contrast ratios
- Test on both iOS and Android

### State Management
- React hooks for local state
- Context providers for global state
- Firebase real-time listeners for data synchronization

## Deployment

### Using Expo Application Services (EAS)
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build: `eas build --platform all`
5. Submit: `eas submit`

### Environment Variables for Production
Make sure to set all environment variables in your build configuration or EAS secrets.

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Test on both platforms
4. Update documentation as needed

## License

This project is part of the Allocatr application suite.
