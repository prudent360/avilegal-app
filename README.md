# AviLegal - Business Registration Platform

A full-stack web application for business registration and incorporation services in Nigeria. Built with Laravel 12 (backend) and React 19 (frontend).

![Laravel](https://img.shields.io/badge/Laravel-12-red)
![React](https://img.shields.io/badge/React-19-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-cyan)

## Features

### For Customers
- 🏢 **Business Registration** - Register companies, NGOs, business names
- 💳 **Online Payment** - Pay via Paystack or Flutterwave
- 📄 **Document Upload** - Upload passport, NIN, photo, signature
- 📊 **Progress Tracking** - Real-time application milestone updates
- 📱 **Responsive Dashboard** - Track all applications in one place

### For Admins
- 👥 **User Management** - View and manage customer accounts
- 📋 **Application Processing** - Review, approve, reject applications
- ✅ **Document Verification** - Approve/reject uploaded documents
- 💰 **Payment Tracking** - Monitor all payment transactions
- 🔐 **Role-Based Access Control** - Granular permissions for staff
- ⚙️ **Settings Management** - Configure payment gateways via UI

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12, PHP 8.2+, SQLite/MySQL |
| Frontend | React 19, Vite 7, TailwindCSS 4 |
| Auth | Laravel Sanctum (API tokens) |
| Payments | Paystack, Flutterwave |

## Quick Start

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Create SQLite database
touch database/database.sqlite

# Run migrations and seed
php artisan migrate --seed

# Create storage link for uploads
php artisan storage:link

# Start server
php artisan serve --port=8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Access the app at **http://localhost:3003**

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@avilegal.com | password123 |
| Admin | admin@avilegal.com | password123 |
| Manager | manager@avilegal.com | password123 |
| Support | support@avilegal.com | password123 |
| Customer | john@example.com | password123 |

## Payment Configuration

Payment gateway keys are managed via Admin → Settings (Super Admin only):

1. Login as superadmin@avilegal.com
2. Navigate to Settings
3. Enter Paystack/Flutterwave API keys
4. Save

## Project Structure

```
avilegal/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Auth/       # Authentication
│   │   │   ├── Admin/      # Admin controllers
│   │   │   └── Api/        # API controllers
│   │   └── Models/         # Eloquent models
│   ├── database/
│   │   ├── migrations/     # Database schema
│   │   └── seeders/        # Test data
│   └── routes/api.php      # API routes
│
└── frontend/               # React SPA
    └── src/
        ├── components/     # Reusable components
        ├── context/        # Auth & Toast contexts
        ├── pages/          # Page components
        │   ├── admin/      # Admin pages
        │   ├── auth/       # Login, Register
        │   └── customer/   # Customer dashboard
        └── services/       # API service
```

## API Endpoints

### Public
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/services` - List services

### Customer (Auth Required)
- `GET /api/customer/applications` - List applications
- `POST /api/customer/payments/initialize` - Start payment
- `POST /api/customer/documents/upload` - Upload document

### Admin (Role Required)
- `GET /api/admin/users` - List users
- `POST /api/admin/applications/{id}/approve` - Approve application
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| Super Admin | Full access including settings |
| Admin | Manage users, applications, documents |
| Manager | View reports, manage applications |
| Support | View users, assist customers |
| Customer | Submit applications, upload docs |

## License

MIT License
