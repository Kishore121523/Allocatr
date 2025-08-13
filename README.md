# Allocatr 💰

**A privacy-first, zero-based budget tracker with AI-powered expense categorization that helps users manage their finances through intelligent spending analysis and flexible budget allocation.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-orange?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🤖 AI-Powered Smart Entry
- **Natural Language Processing**: Type expenses naturally like "spent $25 on coffee this morning"
- **Automatic Categorization**: AI suggests appropriate categories based on your description
- **Voice Input**: Speech-to-text support for hands-free expense entry
- **Smart Date Parsing**: Understands relative dates like "yesterday", "last Monday"

### 🎯 Zero-Based Budgeting
- **Flexible Allocation**: Allocate your income across custom categories
- **Unallocated Funds**: Track money not yet assigned to specific categories
- **Budget Validation**: Smart warnings when adding expenses to unallocated categories
- **Real-time Tracking**: See remaining budget and spending percentages instantly

### 📊 Comprehensive Analytics
- **Spending Insights**: Detailed breakdowns by category, time period, and patterns
- **Visual Charts**: Beautiful charts showing spending trends and category distributions
- **Monthly Tracking**: Compare spending across different months
- **Progress Indicators**: Visual progress bars for budget categories

### 🛡️ Privacy-First Design
- **Local Processing**: AI categorization respects your privacy
- **Secure Authentication**: Firebase-based user authentication
- **Data Ownership**: Your financial data stays under your control
- **No Tracking**: No third-party analytics or data collection

### 🎨 Modern User Experience
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark/Light Themes**: Automatic theme switching based on preferences
- **Smooth Animations**: GSAP-powered animations for delightful interactions
- **Global Quick Add**: Floating action button accessible from any page
- **Keyboard Navigation**: Full accessibility support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account (for authentication and database)
- Azure OpenAI account (optional, for AI features)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/allocatr.git
   cd allocatr
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Azure OpenAI (Optional - for AI features)
   AZURE_OPENAI_API_KEY=your_azure_openai_key
   AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
   AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
   ```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Copy your config values to `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern, accessible component library
- **GSAP**: Professional-grade animations
- **Chart.js**: Data visualization
- **React Hook Form**: Form state management

### Backend & Services
- **Firebase Firestore**: NoSQL database
- **Firebase Auth**: User authentication
- **Azure OpenAI**: AI-powered expense categorization
- **Vercel**: Deployment platform

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing
- **Date-fns**: Date manipulation

## 📱 Core Features Deep Dive

### Smart Expense Entry
The AI-powered expense entry system allows users to input expenses naturally:

```typescript
// Examples of supported natural language inputs:
"$45.50 for groceries at Whole Foods"
"bought coffee for $4.25 yesterday"
"lunch with team - $23.50 on Monday"
"gas station $67.89"
```

### Budget Management
- **Category Creation**: Add popular categories or create custom ones
- **Allocation Tracking**: Set and monitor budget allocations
- **Overspend Alerts**: Visual indicators when categories exceed budget
- **Flexible Budgeting**: Support for unallocated funds and budget adjustments

### Analytics Dashboard
- **Real-time Stats**: Total budget, spent amount, remaining balance
- **Category Breakdown**: Visual representation of spending by category
- **Trend Analysis**: Month-over-month spending comparisons
- **Progress Tracking**: Percentage-based progress indicators

## 🔧 Configuration

### Customizing Categories
Default categories include Housing, Food & Dining, Transportation, Healthcare, Entertainment, and Savings. Users can:
- Add from popular category suggestions
- Create completely custom categories
- Set custom colors for visual organization
- Allocate specific budget amounts

### AI Configuration
The AI categorization system can be configured in `/app/api/categorize/route.ts`:
- Adjust confidence thresholds
- Modify category matching logic
- Customize prompt engineering for better results

## 📄 API Reference

### Expense Categorization
```typescript
POST /api/categorize
Content-Type: application/json

{
  "input": "spent $25 on coffee this morning",
  "categories": ["Food & Dining", "Transportation", "Entertainment"]
}

Response:
{
  "amount": 25.00,
  "description": "coffee",
  "suggestedCategory": "Food & Dining",
  "date": "2024-01-15"
}
```

## 👨‍💻 About This Project

Allocatr is a personal project created to solve real-world budgeting challenges with modern technology. This project showcases:

- **Full-Stack Development**: Next.js 14 with TypeScript and modern React patterns
- **AI Integration**: Azure OpenAI for intelligent expense categorization
- **UI/UX Design**: Custom design system with smooth animations and responsive layouts
- **Database Architecture**: Firebase Firestore with optimized data structures
- **Performance Optimization**: Advanced caching, lazy loading, and efficient state management

## 📊 Project Structure

```
allocatr/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── budget/           # Budget management
│   ├── transactions/     # Transaction history
│   ├── analytics/        # Analytics and insights
│   └── api/             # API routes
├── components/           # React components
│   ├── ui/              # Shadcn/ui components
│   ├── layout/          # Layout components
│   ├── dashboard/       # Dashboard-specific components
│   ├── budget/          # Budget-specific components
│   ├── transactions/    # Transaction components
│   ├── analytics/       # Analytics components
│   └── expense/         # Expense modal components
├── hooks/               # Custom React hooks
├── lib/                # Utility functions
├── providers/          # React context providers
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push to main

### Manual Deployment
```bash
npm run build
npm start
```

## 🔒 Security

- **Environment Variables**: Sensitive data stored securely
- **Firebase Rules**: Database security rules implemented
- **Authentication**: Secure user authentication flow
- **Data Validation**: Input validation and sanitization

## 📱 Mobile Support

Allocatr is fully responsive and works beautifully on:
- iOS Safari
- Android Chrome
- Progressive Web App (PWA) capabilities
- Touch-friendly interactions
- Mobile-optimized layouts

## 🎯 Roadmap

- [ ] **Recurring Transactions**: Support for subscription tracking
- [ ] **Budget Goals**: Savings targets and goal tracking
- [ ] **Export Features**: CSV/PDF export functionality
- [ ] **Multi-Currency**: Support for multiple currencies
- [ ] **Team Budgets**: Shared budgets for families/teams
- [ ] **Bank Integration**: Connect bank accounts (with user consent)

## 📞 Contact & Feedback

This is a personal project, but feedback is always welcome:

- **Email**: [your-email@example.com](mailto:your-email@example.com)
- **LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)
- **Twitter**: [@yourusername](https://twitter.com/yourusername)

For business inquiries or potential collaborations, please reach out via email.

## 📄 License & Usage

This is a personal project and portfolio piece. The code is provided for educational and demonstration purposes.

**Important**: This project is not open source and is not licensed for commercial use or redistribution without explicit permission.

For licensing inquiries or if you're interested in using this project commercially, please contact the author.

## 🙏 Acknowledgments

- **Shadcn/ui**: For the beautiful component library
- **Vercel**: For the deployment platform
- **Firebase**: For backend services
- **Azure OpenAI**: For AI capabilities
- **Community**: Thanks to the open-source community for the amazing tools and libraries

---

**Built with ❤️ as a personal project showcasing modern web development**

---

*This project represents advanced full-stack development skills including AI integration, modern React patterns, and thoughtful UX design. Built as a portfolio piece with potential for future monetization.*