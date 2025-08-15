# Allocatr Mobile App Setup Guide

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root directory with your configuration:
   ```bash
   # Copy your Firebase config from the web app
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id_here

   # Google OAuth for mobile (get from Google Cloud Console)
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id

   # Your web app URL for AI categorization
   EXPO_PUBLIC_WEB_APP_API_URL=https://your-domain.com
   # For development: EXPO_PUBLIC_WEB_APP_API_URL=http://localhost:3000
   ```

3. **Configure Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your existing project (same as web app)
   - Navigate to "Credentials" → "OAuth 2.0 Client IDs"
   - Create a new OAuth client for mobile applications
   - Use the client ID in your environment variables

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Run on device:**
   ```bash
   # iOS
   npm run ios

   # Android  
   npm run android
   ```

## 📱 Features

✅ **Authentication**
- Google OAuth sign-in
- Secure session management
- User profile handling

✅ **Dashboard**
- Budget overview with progress visualization
- Category spending cards
- Key metrics display
- Quick expense addition

✅ **Budget Management**
- Create and edit budgets
- Category allocation with color coding
- Income vs allocation tracking
- Flexibility buffer calculation

✅ **Transactions**
- Complete transaction history
- Advanced filtering and search
- Date grouping and sorting
- AI categorization indicators

✅ **Analytics**
- Interactive charts with Victory Native
- Spending trends over time
- Category distribution pie charts
- Budget vs actual comparisons
- Intelligent insights

✅ **AI Integration**
- Natural language expense input
- Automatic categorization
- Confidence scoring
- Manual override capabilities

## 🛠 Technical Stack

- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **NativeWind** for Tailwind CSS styling
- **Firebase** for backend (same as web app)
- **Victory Native** for charts and visualizations
- **React Navigation** for navigation
- **Expo Auth Session** for Google OAuth

## 📂 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Basic components (Button, Card, etc.)
│   ├── dashboard/     # Dashboard-specific components  
│   ├── budget/        # Budget management components
│   ├── transactions/  # Transaction components
│   ├── analytics/     # Analytics components
│   └── expense/       # Expense modal component
├── screens/           # Main screen components
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── BudgetScreen.tsx
│   ├── TransactionsScreen.tsx
│   └── AnalyticsScreen.tsx
├── navigation/        # Navigation configuration
├── hooks/            # Custom React hooks
│   ├── use-auth.ts
│   ├── use-budget.ts
│   ├── use-transactions.ts
│   └── use-ai-categorization.ts
├── providers/        # Context providers
│   ├── auth-provider.tsx
│   └── month-provider.tsx
├── lib/              # Utilities and configurations
│   ├── firebase.ts
│   ├── utils.ts
│   └── budget-calculations.ts
└── types/            # TypeScript definitions
    └── index.ts
```

## 🔧 Configuration Files

- **app.config.js** - Expo configuration with environment variables
- **metro.config.js** - Metro bundler config for NativeWind
- **babel.config.js** - Babel configuration for NativeWind
- **tailwind.config.js** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript configuration

## 🎨 Design System

The mobile app maintains visual consistency with the web app:

- **Colors:** Same color palette as web app
- **Typography:** Inter font family
- **Components:** Mobile-optimized versions of web components
- **Spacing:** Consistent spacing system
- **Icons:** Ionicons matching Lucide icons from web

## 🔄 Data Synchronization

- **Real-time sync** with Firestore
- **Same database** as web app
- **Offline support** with Firestore persistence
- **Automatic updates** via Firestore listeners

## 🚨 Troubleshooting

### Build Issues
- Clear Expo cache: `expo start --clear`
- Reset Metro cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Firebase Connection
- Verify environment variables are loaded
- Check Firebase project settings
- Ensure Firestore rules allow read/write access

### Google OAuth Issues
- Verify OAuth client ID for mobile platform
- Check bundle identifier matches
- Ensure redirect URLs are configured

### NativeWind Styling
- Check babel.config.js includes NativeWind plugin
- Verify metro.config.js is properly configured
- Ensure global.css is imported in App.tsx

## 📱 Testing

### Development Testing
- Use Expo Go app for quick testing
- Test on both iOS and Android simulators
- Verify Firebase connection and data sync

### Production Testing
- Build development builds with EAS
- Test Google OAuth flow
- Verify offline functionality
- Test AI categorization with web app

## 🚀 Deployment

### Using EAS Build
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build: `eas build --platform all`
5. Submit: `eas submit`

### Environment Variables for Production
- Set all environment variables in EAS secrets
- Ensure production URLs are used
- Verify Firebase project settings

## 🔗 Integration with Web App

The mobile app seamlessly integrates with your existing web app:

1. **Shared Database:** Uses same Firestore collections
2. **AI Categorization:** Calls web app's API endpoints
3. **User Accounts:** Same authentication system
4. **Data Structure:** Compatible data models

## 💡 Development Tips

1. **Hot Reload:** Expo provides fast refresh for development
2. **Debugging:** Use Flipper or React Native Debugger
3. **Testing:** Test frequently on real devices
4. **Performance:** Monitor bundle size and rendering performance
5. **Accessibility:** Test with screen readers and accessibility tools

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Expo documentation
3. Check Firebase setup guide
4. Review React Navigation docs

The mobile app is now ready for development and testing!
