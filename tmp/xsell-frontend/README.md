# X-UI SELL Panel - Frontend Only

This is the frontend-only version of the X-UI SELL Panel, extracted without any backend dependencies.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Header, Sidebar, Layout)
│   └── UI/             # Basic UI components (Button, Card, Modal, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── config/             # Configuration files
├── types/              # TypeScript type definitions
└── styles/             # CSS and styling files
```

## 🎨 Features

- **Modern React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **React Router** for navigation
- **Recharts** for data visualization
- **Responsive Design** - works on all devices
- **Dark Mode Support**
- **Professional UI Components**

## 📱 Pages Included

- **Dashboard** - Overview and statistics
- **User Management** - Add, edit, delete users
- **Advanced Users** - Bulk operations and filtering
- **Traffic Monitoring** - Traffic analysis and charts
- **Live Statistics** - Real-time monitoring
- **Panels Management** - X-UI panel management
- **Panel Features** - Advanced panel features
- **Admins Management** - Admin user management
- **Settings** - System configuration
- **API Testing** - API endpoint testing
- **Login** - Authentication page

## 🔧 Configuration

The frontend is configured to work as a standalone application. You can:

1. **Connect to your own backend** by updating the API endpoints in `src/config/api.ts`
2. **Use mock data** - the current implementation includes mock data for demonstration
3. **Customize styling** by modifying Tailwind classes and components

## 🎯 Key Components

### Layout Components
- `Layout.tsx` - Main application layout
- `Header.tsx` - Top navigation bar
- `Sidebar.tsx` - Side navigation menu

### UI Components
- `Button.tsx` - Customizable button component
- `Card.tsx` - Container component with hover effects
- `Modal.tsx` - Modal dialog component
- `LoadingSpinner.tsx` - Loading indicator
- `StatCard.tsx` - Statistics display card

### Hooks
- `useAuth.tsx` - Authentication management
- `useApi.ts` - API data fetching
- `useAdvancedApi.ts` - Advanced API operations
- `useNotifications.ts` - Notification system

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Dark mode** support with `dark:` prefixes
- **Responsive design** with mobile-first approach
- **Custom animations** with Framer Motion
- **Professional color scheme** with purple/blue theme

## 📦 Dependencies

### Core Dependencies
- React 18.3.1
- React DOM 18.3.1
- React Router DOM 6.22.0
- TypeScript 5.5.3

### UI & Styling
- Tailwind CSS 3.4.1
- Framer Motion 11.0.0
- Lucide React 0.344.0

### Data & Forms
- Recharts 2.12.0
- React Hook Form 7.50.0
- Date-fns 3.3.0

## 🚀 Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Configure your web server** to serve the SPA correctly (redirect all routes to index.html)

## 📄 License

MIT License - feel free to use this frontend in your own projects.

## 🙏 Credits

Design and developed by Hmray
Copyright © 2025