i need to create a next js application, it has 3 admin,kitchen,menu

ResturantOrder is a full-stack, contactless dining platform designed to digitize restaurant operations. From scanning a QR code to placing an order and managing kitchen workflows — everything runs on a clean, modern web app built with Next.js, PostgreSql, and SCSS. ✨ Features 📱 QR Code-Based Access: Every table gets a unique QR code for instant menu access. 🍽️ Smart Ordering: Customers can browse menus, add items, and place orders — no app download required. 🧑‍🍳 Live Kitchen Dashboard: Real-time order updates for chefs to prep efficiently. 🧑‍💼 Admin Panel: Manage tables, orders, inventory, payroll, and more. ⚡ Real-Time UI: Fast, responsive, and optimized for mobile/tablet/desktop. 🌗 Dark Theme Support: Modern design with animation and smooth transitions. 🛠️ Tech Stack Frontend: Next.js Styling: SCSS (SASS) Backend: API Routes in Next.js Database: PostgreSql State Management: React Context + Redux 🔍 Try it out ResturantOrder has three interfaces customers and restaurant's admin kitchen.

Three menu,kitchen,admin every function should have CRUD ability, every button should work with database if it is saving data 🧑 Customer Login: Goto Menu Page or Scan the QR Code Click on order button Enter Name and Phone(sri lankan +94) (10 digit number format) Login complete, now add few items in cart and place order ResturantOrder QR 👨‍💼 Admin Login (Open in separate browser): Goto Homepage, and scroll down to login section Enter email: admin@starbucks.com Enter password: starbucks@123 Login complete, Now visit Admin Dashboard or Kitchen Dashboard Admin Login Page ✅ Features: Simple login form (email, password) Add demo user credentials (for demo): admin@starbucks.com starbucks@123 Redirect to /admin on success

Kitchen Dashboard (Real-time) ✅ Features: List of current orders Order status (Pending → Preparing → Done) Filters by table, status Menu + Order Flow ✅ Features: /menu page with dynamic menu items Add to cart, update quantity Place order (send to backend) Show "Order Confirmed" and update kitchen 1.saving all the data to Postgresql like (customer details, sign up, menus, kitchen details, customer behavior, 2.currency is lkr 3.add payment gate way (that is payhere sand box) , hardcode other details like delivery_address for payhere we only have name,phone so everything else is hardcode 4.admin panel is not constructed fully) 5.if anything happens like item added to card there should be a toast message 6.implement qr scanning functionality 7.invoice and ordering and every message should be sent to customer mobile number 8. log out the customer 9. add every other neccasry function and requirments for the restaurant ordering system 10. sms gateway for send.lk 11. generate a QR code for takeaway it should be in the home page hero section

These are .env.local credentials

Next.js App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

database Configuration
PayHere Payment Gateway (Sri Lankan Payment Provider)
NEXT_PUBLIC_PAYHERE_MERCHANT_ID=1231078 NEXT_PUBLIC_PAYHERE_MERCHANT_SECRET=MjU4Mjc1MjkxNjI1NzU5MDM0NDAyNjMzNjYyODY2MTg4Mjk2Mjk2 NEXT_PUBLIC_PAYHERE_SANDBOX=true

SMS Service Configuration (Optional - for order notifications)
SMS_API_KEY=3380|U4XyhAoVB4PZjBikRgNqXu33cLdnCBabMVHcEYM5 SMS_API_URL=https://sms.send.lk/api/v3/

15 days ago
Base44 AI
Base44
High-Level App Plan
This restaurant ordering system needs three main interfaces with sophisticated design and real-time functionality:

Key Features to Implement:

Customer Menu Interface - QR code access, browsing, cart management, ordering
Kitchen Dashboard - Real-time order management with status updates
Admin Panel - Complete restaurant management (orders, menu items, tables, analytics)
Payment Integration - PayHere gateway for Sri Lankan payments
SMS Notifications - Order confirmations and updates via Send.lk
QR Code Generation - Dynamic codes for tables and takeaway
Design Language: Ultra-modern, minimalist interface with a sophisticated Sri Lankan restaurant aesthetic. Clean whites, warm accent colors (deep orange/amber for food warmth), and premium typography. Mobile-first responsive design with smooth animations.

App Organization:

Separate pages for each interface (Menu, Kitchen, Admin)
Shared components for orders, menu items, and forms
Real-time state management for order updates
Integrated payment and SMS workflows
Let me build this complete restaurant ordering system with all the CRUD functionality, payment integration, and real-time features.