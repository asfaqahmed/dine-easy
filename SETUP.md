# DineEasy Setup Guide

## Prerequisites

Before setting up DineEasy, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd dine-easy

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory with the following configuration:

```env
# Next.js App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/dine_easy
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# JWT Secret (change in production)
JWT_SECRET=your-secret-key-change-in-production

# PayHere Payment Gateway (Sri Lankan Payment Provider)
NEXT_PUBLIC_PAYHERE_MERCHANT_ID=1231078
NEXT_PUBLIC_PAYHERE_MERCHANT_SECRET=MjU4Mjc1MjkxNjI1NzU5MDM0NDAyNjMzNjYyODY2MTg4Mjk2Mjk2
NEXT_PUBLIC_PAYHERE_SANDBOX=true

# SMS Service Configuration (Optional - for order notifications)
SMS_API_KEY=3380|U4XyhAoVB4PZjBikRgNqXu33cLdnCBabMVHcEYM5
SMS_API_URL=https://sms.send.lk/api/v3/
```

### 3. Database Setup

```bash
# Run the automated database setup
npm run setup
```

This will:
- Create the `dine_easy` database
- Set up all required tables
- Create the default admin user
- Insert sample data

### 4. Start the Application

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Login Credentials

### Admin Login
- **Email**: admin@starbucks.com
- **Password**: starbucks@123
- **Access**: Full admin panel, kitchen dashboard

### Customer Login
- **Process**: Enter name and phone number on menu page
- **Format**: Sri Lankan phone numbers (+94XXXXXXXXX)

## Application Structure

### Customer Flow
1. **Home Page** (`/`) - Landing page with takeaway QR code
2. **Menu Page** (`/menu`) - Browse menu, add to cart, place orders
3. **Customer Login** - Simple name + phone authentication
4. **Payment** - PayHere gateway integration
5. **Order Tracking** - SMS notifications for order status

### Admin/Staff Flow
1. **Admin Panel** (`/admin`) - Management dashboard
2. **Kitchen Dashboard** (`/kitchen`) - Real-time order management
3. **Menu Management** - CRUD operations for menu items
4. **Order Management** - View and update order status
5. **Table Management** - QR code generation for tables

## Key Features

### ✅ Implemented Features

- **QR Code-Based Ordering**: Unique QR codes for tables and takeaway
- **Contactless Menu**: Digital menu with category filtering
- **Real-time Kitchen Dashboard**: Live order updates for kitchen staff
- **Admin Management Panel**: Complete restaurant management
- **PayHere Payment Integration**: Sri Lankan payment gateway
- **SMS Notifications**: Order updates via Send.lk API
- **Mobile-Responsive Design**: Works on all devices
- **Order Status Tracking**: Real-time order progression
- **Customer Management**: Phone-based customer identification
- **Table Management**: QR code generation for dining tables

### 🛠 Technical Features

- **Next.js 14**: Modern React framework with App Router
- **PostgreSQL**: Robust relational database
- **JWT Authentication**: Secure admin and customer sessions
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type-safe development
- **Real-time Updates**: Automatic order status refresh
- **Mobile-First Design**: Optimized for smartphones

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/customer/login` - Customer login
- `GET /api/auth/admin/me` - Get admin session
- `GET /api/auth/customer/me` - Get customer session

### Menu Management
- `GET /api/menu` - Get available menu items
- `POST /api/menu` - Create menu item (admin only)

### Order Management
- `GET /api/orders` - Get orders (admin only)
- `POST /api/orders` - Create new order (customer)
- `PATCH /api/orders/[id]/status` - Update order status (admin)

### Payment
- `POST /api/payment/initiate` - Start PayHere payment
- `POST /api/payment/notify` - PayHere webhook

### QR Codes
- `GET /api/qr/generate` - Generate QR codes for tables

## Database Schema

### Core Tables
- **customers** - Customer information
- **menu_items** - Restaurant menu with pricing
- **orders** - Order records with status tracking
- **order_items** - Individual items within orders
- **restaurant_tables** - Table management with QR codes
- **admin_users** - Staff authentication
- **payment_transactions** - Payment tracking
- **sms_logs** - SMS notification logs

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify credentials in `.env.local`
   - Ensure database exists

2. **PayHere Payments Not Working**
   - Verify sandbox mode is enabled for testing
   - Check merchant credentials
   - Ensure webhook URL is accessible

3. **SMS Not Sending**
   - Check Send.lk API credentials
   - Verify phone number format (+94XXXXXXXXX)
   - Check API rate limits

### Reset Database

```bash
# Reset and recreate the database
npm run db:reset
```

## Production Deployment

### Environment Variables
Update `.env.local` for production:

```env
# Production settings
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_PAYHERE_SANDBOX=false
JWT_SECRET=secure-random-secret-for-production
```

### Database Migration
Ensure production database is set up with the schema:

```bash
# Run setup on production
npm run setup
```

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Verify environment configuration

## License

This project is built for restaurant management and ordering systems.