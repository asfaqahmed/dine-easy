# DineEasy - Smart Restaurant Ordering System

A full-stack, contactless dining platform designed to digitize restaurant operations. From scanning a QR code to placing an order and managing kitchen workflows — everything runs on a clean, modern web app built with Next.js, PostgreSQL, and Tailwind CSS.

![DineEasy Demo](https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop)

## ✨ Features

### 📱 Customer Experience
- **QR Code Access**: Unique QR codes for every table and takeaway ordering
- **Contactless Ordering**: No app download required - works in any mobile browser
- **Smart Cart**: Add items, customize quantities, special instructions
- **Real-time Updates**: SMS notifications for order status changes
- **Secure Payments**: PayHere integration for Sri Lankan LKR payments
- **Multi-language**: English interface optimized for Sri Lankan users

### 🧑‍🍳 Kitchen Management
- **Real-time Dashboard**: Live order updates as customers place them
- **Order Status Tracking**: Pending → Confirmed → Preparing → Ready → Completed
- **Order Details**: Customer info, table numbers, special instructions
- **Time Management**: Preparation time estimates and tracking
- **Mobile Optimized**: Works perfectly on kitchen tablets

### 🧑‍💼 Admin Panel
- **Complete Menu Management**: Add, edit, delete menu items with categories
- **Order Analytics**: Track daily orders, revenue, popular items
- **Table Management**: Generate and manage QR codes for dining tables
- **Customer Database**: View customer history and preferences
- **Real-time Monitoring**: Monitor kitchen performance and order flow

### ⚡ Technical Features
- **Mobile-First Design**: Responsive across all devices
- **Real-time Updates**: Automatic refresh of order statuses
- **Secure Authentication**: JWT-based admin and customer sessions
- **Database Integration**: Full PostgreSQL integration with CRUD operations
- **Payment Processing**: PayHere sandbox and production support
- **SMS Integration**: Send.lk API for order notifications
- **QR Code Generation**: Dynamic QR codes for tables and takeaway

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with UUID primary keys
- **Authentication**: JWT with secure HTTP-only cookies
- **Payments**: PayHere Gateway (Sri Lankan)
- **SMS**: Send.lk API integration
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd dine-easy
npm install
```

2. **Set up environment variables**
Create `.env.local` file:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/dine_easy
JWT_SECRET=your-secret-key
NEXT_PUBLIC_PAYHERE_MERCHANT_ID=1231078
NEXT_PUBLIC_PAYHERE_MERCHANT_SECRET=MjU4Mjc1MjkxNjI1NzU5MDM0NDAyNjMzNjYyODY2MTg4Mjk2Mjk2
NEXT_PUBLIC_PAYHERE_SANDBOX=true
SMS_API_KEY=3380|U4XyhAoVB4PZjBikRgNqXu33cLdnCBabMVHcEYM5
SMS_API_URL=https://sms.send.lk/api/v3/
```

3. **Set up the database**
```bash
npm run setup
```

4. **Start the development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔐 Default Login Credentials

### Admin Access
- **Email**: admin@starbucks.com
- **Password**: starbucks@123
- **Access**: Admin panel (`/admin`) and Kitchen dashboard (`/kitchen`)

### Customer Access
- **Process**: Enter name and Sri Lankan phone number (+94XXXXXXXXX)
- **No password required** - phone-based identification

## 📱 How It Works

### For Customers
1. **Scan QR Code** at table or use takeaway QR on homepage
2. **Browse Menu** by categories with photos and descriptions
3. **Add to Cart** with quantity selection and special instructions
4. **Enter Details** - name and phone number for order tracking
5. **Place Order** and receive SMS confirmation
6. **Pay Securely** through PayHere gateway in LKR
7. **Track Progress** via SMS updates (Preparing → Ready → Completed)

### For Kitchen Staff
1. **Monitor Orders** in real-time on kitchen dashboard
2. **Update Status** as orders progress through preparation
3. **View Details** including customer info and special instructions
4. **Track Time** with preparation estimates
5. **Notify Customers** automatically via SMS when orders are ready

### For Administrators
1. **Manage Menu** - add, edit, delete items with pricing in LKR
2. **View Analytics** - daily orders, revenue, popular items
3. **Handle Tables** - generate QR codes for dining tables
4. **Monitor Operations** - real-time view of all orders and kitchen status
5. **Customer Management** - view order history and preferences

## 🏗️ Project Structure

```
dine-easy/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Homepage with takeaway QR
│   ├── menu/              # Customer menu interface
│   ├── admin/             # Admin management panel
│   ├── kitchen/           # Kitchen dashboard
│   └── api/               # API routes
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── lib/                   # Utilities and business logic
│   ├── models/           # Database models
│   ├── auth.ts           # Authentication logic
│   ├── utils.ts          # Helper functions
│   ├── sms.ts            # SMS service
│   └── payhere.ts        # Payment integration
└── setup.js              # Database setup script
```

## 🌟 Key Features Implemented

- ✅ **QR Code-Based Access** for tables and takeaway
- ✅ **Smart Menu System** with categories and search
- ✅ **Real-time Kitchen Dashboard** with live updates
- ✅ **Admin Management Panel** with full CRUD operations
- ✅ **PayHere Payment Integration** for LKR transactions
- ✅ **SMS Notifications** via Send.lk API
- ✅ **Customer Phone Authentication** (Sri Lankan format)
- ✅ **Order Status Tracking** with real-time updates
- ✅ **Mobile-First Responsive Design**
- ✅ **Toast Notifications** for user feedback
- ✅ **Secure JWT Authentication** for admin users
- ✅ **PostgreSQL Database** with complete schema
- ✅ **Table Management** with QR code generation
- ✅ **Multi-currency Support** (LKR primary)

## 🔧 Configuration

### Database Schema
The application uses PostgreSQL with these main tables:
- `customers` - Customer information and phone numbers
- `menu_items` - Restaurant menu with categories and pricing
- `orders` - Order tracking with status and payment info
- `order_items` - Individual items within each order
- `restaurant_tables` - Table management with QR codes
- `admin_users` - Staff authentication and roles
- `payment_transactions` - PayHere payment tracking
- `sms_logs` - SMS notification history

### Payment Integration
- **Sandbox Mode**: Enabled by default for testing
- **Production**: Set `NEXT_PUBLIC_PAYHERE_SANDBOX=false`
- **Currency**: LKR (Sri Lankan Rupees)
- **Hardcoded Fields**: Address, city (as specified in requirements)

### SMS Integration
- **Provider**: Send.lk API
- **Format**: Sri Lankan phone numbers (+94XXXXXXXXX)
- **Triggers**: Order confirmation, status updates, payment confirmation

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/customer/login` - Customer phone authentication
- `GET /api/auth/*/me` - Get current session

### Menu Management
- `GET /api/menu` - Fetch available menu items
- `POST /api/menu` - Add new menu item (admin only)

### Order Management
- `GET /api/orders` - List orders (admin only)
- `POST /api/orders` - Place new order
- `PATCH /api/orders/[id]/status` - Update order status

### Payment Processing
- `POST /api/payment/initiate` - Start PayHere payment
- `POST /api/payment/notify` - PayHere webhook handler

## 🚀 Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables for production
3. Set PayHere to production mode
4. Verify SMS API credentials

### Database Migration
```bash
npm run setup  # Creates tables and default admin user
```

## 🔗 Links

- **Homepage**: Landing page with takeaway QR code
- **Menu**: `/menu` - Customer ordering interface
- **Admin Panel**: `/admin` - Restaurant management
- **Kitchen Dashboard**: `/kitchen` - Real-time order management

## 📞 Support

For setup assistance or questions:
1. Check the [Setup Guide](SETUP.md)
2. Verify environment configuration
3. Review troubleshooting section

---

Built with ❤️ for modern restaurants seeking digital transformation. This system handles everything from QR code scanning to payment processing, making dining contactless and efficient.