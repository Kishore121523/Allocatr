# Allocatr 💰

**A privacy-first, zero-based budget tracker with AI-powered expense categorization that helps users manage their finances through intelligent spending analysis and flexible budget allocation.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-orange?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Azure OpenAI](https://img.shields.io/badge/Azure_OpenAI-0078D4?style=flat-square&logo=microsoft)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/allocatr.git
   cd allocatr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Firebase and Azure OpenAI credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 🎯 Live Demo

**Link** A live demo will be available at [allocatr.vercel.app](https://allocatr-neon.vercel.app/)

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
- **Real-time tracking**: Reports generated with current month's data for accurate, up-to-date insights

### 📊 Comprehensive Analytics & Visualizations
- **Interactive Charts**: Beautiful doughnut charts showing category spending distributions
- **Spending Trends**: Bar charts displaying daily/monthly spending patterns over time
- **Real-time Progress**: Dynamic progress bars with percentage indicators for budget categories
- **Visual Insights**: Color-coded category breakdowns with spending vs. budget comparisons
- **Monthly Comparisons**: Side-by-side visual analysis of spending across different time periods
- **Responsive Graphs**: Charts that adapt perfectly to desktop, tablet, and mobile screens

### 📋 AI-Powered Summary Reports
- **Comprehensive Analysis**: AI-generated monthly financial summaries with personalized insights
- **Natural Language Reports**: Easy-to-read reports written in conversational, encouraging language
- **Smart Recommendations**: Personalized financial advice based on spending patterns and budget performance
- **Achievement Recognition**: Celebrates good financial habits and provides constructive feedback
- **Actionable Insights**: Clear next steps and recommendations for improving financial health
- **Real-time Generation**: Reports generated with up-to-date data from your current month

### 🛡️ Privacy-First Design
- **Secure Authentication**: Firebase-based user authentication
- **Data Ownership**: Your financial data stays under your control
- **No Tracking**: No third-party analytics or data collection

### 🎨 Modern User Experience
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Dark/Light Themes**: Automatic theme switching based on preferences
- **Smooth Animations**: GSAP-powered animations for delightful interactions
- **Global Quick Add**: Floating action button accessible from any page

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
- **Real-time Stats**: Total budget, spent amount, remaining balance with visual indicators
- **Interactive Doughnut Charts**: Click and hover effects showing category spending breakdowns
- **Dynamic Bar Charts**: Animated spending trends with smooth transitions and tooltips
- **Progress Visualizations**: Gradient progress bars with color-coded budget status (green/yellow/red)
- **Trend Analysis**: Month-over-month comparisons with Chart.js powered visualizations
- **Responsive Design**: Charts automatically resize and reflow for optimal viewing on any device


## 🔧 Configuration

### Customizing Categories
Default categories include Housing, Food & Dining, Transportation, Healthcare, Entertainment, and Savings. Users can:
- Add from popular category suggestions
- Create completely custom categories
- Allocate specific budget amounts


## 👨‍💻 About This Project

Allocatr is a personal project created to solve real-world budgeting challenges with modern technology. This project showcases:

- **Full-Stack Development**: Next.js 14 with TypeScript and modern React patterns
- **AI Integration**: Azure OpenAI for intelligent expense categorization
- **UI/UX Design**: Custom design system with GSAP animations, Chart.js visualizations, and responsive layouts
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

## 🔒 Security

- **Environment Variables**: Sensitive data stored securely
- **Firebase Rules**: Database security rules implemented
- **Authentication**: Secure user authentication flow
- **Data Validation**: Input validation and sanitization
- **CORS Protection**: Cross-origin request protection
- **Rate Limiting**: API endpoint protection against abuse

## 🛣️ Roadmap

### Phase 1: Core Features ✅
- [x] Zero-based budgeting system
- [x] AI-powered expense categorization
- [x] Basic analytics and visualizations
- [x] User authentication

### Phase 2: Enhanced Analytics 🚧
- [x] Advanced chart visualizations
- [x] AI summary reports
- [ ] Voice input support
- [ ] Export functionality (CSV/PDF)
- [ ] Budget templates and sharing

### Phase 3: Advanced Features 📋
- [ ] Multi-currency support
- [ ] Recurring transaction detection
- [ ] Bill reminders and notifications

### Phase 4: Social & Collaboration 🤝
- [ ] Family/household budget sharing
- [ ] Anonymous spending insights

## 🤝 Contributing

While this is primarily a personal project, I welcome feedback and suggestions!


## 📄 License & Usage

This is a personal project and portfolio piece. The code is provided for educational and demonstration purposes.

**Important**: This project is not open source and is not licensed for commercial use or redistribution without explicit permission.

For licensing inquiries or if you're interested in using this project commercially, please contact the author.

## Acknowledgments

- **Shadcn/ui**: For the beautiful component library
- **Vercel**: For the deployment platform
- **Firebase**: For backend services
- **Azure OpenAI**: For AI capabilities
- **Community**: Thanks to the open-source community for the amazing tools and libraries

---

*This project represents advanced full-stack development skills including AI integration, modern React patterns, and thoughtful UX design. Built as a portfolio piece with potential for future monetization.*