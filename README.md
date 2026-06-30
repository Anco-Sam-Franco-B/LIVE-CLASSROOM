# Live Class Code (LCC)

A comprehensive Enterprise Live Class Code (LCC) built with React and Node.js that enables live online classroom experiences with integrated video conferencing, course management, assessments, and payment processing.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database](#database)
- [Security Features](#security-features)
- [Real-time Communication](#real-time-communication)
- [Payment Integration](#payment-integration)
- [Contributing](#contributing)
- [License](#license)

## Overview

Live Class Code (LCC) is an enterprise-grade Learning Management System designed for modern educational institutions and corporate training programs. It provides a full-featured platform for creating and managing courses, conducting live classes via video conferencing, tracking student progress, assessing knowledge through quizzes and assignments, and managing payments and subscriptions.

### Key Use Cases
- **Educational Institutions**: Manage online and blended learning programs
- **Corporate Training**: Deliver employee development and compliance training
- **Skill Development Platforms**: Create and monetize online courses
- **Professional Development**: Offer continuing education and certifications

## Features

### 🎓 Learning Management
- **Course Management**: Create, organize, and manage courses with modules and lessons
- **Progress Tracking**: Real-time student progress monitoring and analytics
- **Certificate Generation**: Automated certificate issuance upon course completion
- **Course Categories**: Organize courses by subject matter and difficulty level
- **Enrollment Management**: Handle course enrollment with access controls

### 📹 Live Classes
- **Video Conferencing**: Integrated with LiveKit for high-quality video sessions
- **Live Meetings**: Schedule and conduct live lectures and interactive sessions
- **Meeting Management**: Create, update, and monitor live class sessions
- **Attendance Tracking**: Automated attendance logging for live sessions
- **Real-time Notifications**: Instant notifications for class updates and announcements

### 📚 Content & Assessments
- **Lesson Management**: Organize content into structured lessons
- **Quizzes**: Create and administer quizzes with various question types
- **Assignments**: Assign coursework with submission deadlines
- **Grading System**: Manage grades and provide feedback on assignments
- **Performance Analytics**: Detailed reports on student performance and engagement

### 💰 Payments & Subscriptions
- **Payment Processing**: Integrated with MTN MoMo and Airtel Money (Africa-focused)
- **Subscription Management**: Handle course and platform subscriptions
- **Invoice Generation**: Automatic invoice creation and PDF generation
- **Transaction Tracking**: Comprehensive transaction history and reporting
- **Payment Verification**: Secure payment webhook handling

### 👥 User Management
- **Role-Based Access**: Admin, Instructor, and Student roles
- **User Profiles**: Manage user information and preferences
- **Authentication**: Secure JWT-based authentication with refresh tokens
- **Authorization**: Fine-grained permission control based on roles

### 📊 Admin Dashboard
- **System Administration**: Manage users, courses, and platform settings
- **Reporting**: Comprehensive analytics and reporting tools
- **Content Moderation**: Approve and manage user-generated content
- **System Settings**: Configure platform-wide settings and features
- **User Management**: Add, edit, and manage user accounts

### 💬 Communication
- **Messaging**: Direct messaging between users
- **Announcements**: Broadcast messages to courses or entire platform
- **Notifications**: Real-time notification system for various events
- **Discussion Forums**: Course discussion and collaboration spaces

## Tech Stack

### Frontend
- **Framework**: React 19.2.7 with Vite
- **Styling**: Tailwind CSS 4.3.1
- **State Management**: Zustand 5.0.14
- **HTTP Client**: Axios 1.18.1
- **Form Handling**: React Hook Form 7.80.0
- **Routing**: React Router DOM 6.30.4
- **Real-time Communication**: Socket.IO Client 4.8.3
- **Video Conferencing**: LiveKit Client 2.20.0 & Components React 2.9.21
- **Data Fetching**: React Query (@tanstack/react-query) 5.101.1
- **UI Icons**: Lucide React, React Icons
- **Charts**: Chart.js with react-chartjs-2
- **QR Codes**: qrcode.react

### Backend
- **Runtime**: Node.js with Express.js 4.21.0
- **Real-time**: Socket.IO 4.8.3
- **Database**: PostgreSQL with pg driver 8.13.0
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Security**: 
  - Helmet.js 7.1.0 (HTTP headers)
  - bcryptjs 2.4.3 (password hashing)
  - express-validator 7.2.0 (input validation)
  - xss-clean 0.1.4 (XSS protection)
  - express-rate-limit 7.4.1 (rate limiting)
- **Video Backend**: LiveKit Server SDK 2.15.5
- **File Handling**: Multer 1.4.5-lts.1
- **PDF Generation**: pdfkit 0.19.1
- **Email**: Nodemailer 6.9.15
- **QR Codes**: qrcode 1.5.4
- **HTTP Proxy**: http-proxy-middleware 4.1.1
- **Utilities**: UUID 10.0.0, dotenv 16.4.5, CORS 2.8.5
- **Testing**: Jest 29.7.0, Supertest 7.0.0
- **Development**: Nodemon 3.1.7

## Project Structure

```
LIVE-CLASSROOM/
├── frontend/                      # React + Vite frontend application
│   ├── src/
│   │   ├── components/           # Reusable React components
│   │   ├── pages/                # Page components (routes)
│   │   ├── layouts/              # Layout components
│   │   ├── routes/               # Route definitions
│   │   ├── services/             # API service layer
│   │   ├── store/                # Zustand state management
│   │   ├── utils/                # Utility functions
│   │   ├── assets/               # Static assets (images, icons)
│   │   ├── App.jsx               # Main App component
│   │   └── main.jsx              # Application entry point
│   ├── index.html                # HTML template
│   ├── vite.config.js            # Vite configuration with API proxies
│   ├── package.json              # Dependencies and scripts
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   └── .oxlintrc.json            # Linting rules
│
├── server/                        # Express.js backend application
│   ├── controllers/              # Request handlers (business logic)
│   │   ├── authController.js     # Authentication & authorization
│   │   ├── courseController.js   # Course management
│   │   ├── userController.js     # User management
│   │   ├── meetingController.js  # Live class management
│   │   ├── paymentController.js  # Payment processing
│   │   ├── quizController.js     # Quiz management
│   │   ├── assignmentController.js # Assignment management
│   │   ├── certificateController.js # Certificate generation
│   │   ├── reportController.js   # Analytics & reporting
│   │   └── [other controllers]   # Additional feature controllers
│   │
│   ├── routes/                   # API route definitions
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── courses.js            # Course endpoints
│   │   ├── users.js              # User endpoints
│   │   ├── meetings.js           # Meeting endpoints
│   │   ├── payments.js           # Payment endpoints
│   │   ├── livekit.js            # LiveKit endpoints
│   │   └── [other routes]        # Additional feature routes
│   │
│   ├── middleware/               # Express middleware
│   │   ├── errorHandler.js       # Global error handling
│   │   ├── rateLimiter.js        # Rate limiting
│   │   ├── authentication.js     # JWT verification
│   │   └── validation.js         # Input validation
│   │
│   ├── database/                 # Database setup and seeding
│   │   ├── setup.js              # Database initialization
│   │   └── seed.js               # Sample data loading
│   │
│   ├── services/                 # Business logic services
│   │   ├── emailService.js       # Email sending
│   │   ├── pdfService.js         # PDF generation
│   │   └── [other services]      # Additional services
│   │
│   ├── validators/               # Input validation schemas
│   │   └── [validation rules]    # Validation logic
│   │
│   ├── sockets/                  # Socket.IO event handlers
│   │   └── [socket logic]        # Real-time communication
│   │
│   ├── utils/                    # Utility functions
│   │   └── [helpers]             # Helper functions
│   │
│   ├── config/                   # Configuration files
│   │   ├── env.js                # Environment variables
│   │   └── database.js           # Database configuration
│   │
│   ├── webhooks/                 # External service webhooks
│   │   └── [payment webhooks]    # Payment provider callbacks
│   │
│   ├── app.js                    # Express app setup
│   ├── server.js                 # Server entry point
│   ├── package.json              # Dependencies and scripts
│   ├── .env                       # Environment variables (local)
│   ├── .env.example              # Environment template
│   └── uploads/                  # File upload directory
│
└── .gitignore                    # Git ignore rules

```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **PostgreSQL** (v12 or higher) - For database
- **Git** - For version control

### Optional
- **Docker** - For containerized deployment
- **LiveKit Server** - For self-hosted video conferencing (or use cloud version)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Anco-Sam-Franco-B/LIVE-CLASSROOM.git
cd LIVE-CLASSROOM
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Setup database (creates tables and schema)
npm run setup-db

# Optional: Seed database with sample data
npm run seed

# Copy environment template and configure
cp .env.example .env
# Edit .env with your configuration (see Environment Configuration)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Copy environment template if needed
cp .env.example .env.development
# Configure any necessary environment variables
```

## Environment Configuration

### Backend (.env)

Create a `.env` file in the `server/` directory based on `.env.example`:

```dotenv
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/live_classroom?sslmode=disable

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REMEMBER_EXPIRES_IN=30d

# Email Configuration (Gmail SMTP Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@live-classroom.com

# Frontend URL
CLIENT_URL=http://localhost:5173

# File Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# LiveKit Configuration
LIVEKIT_API_URL=http://localhost:7880
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# Payment Providers - MTN MoMo
MTN_MOMO_API_KEY=your-mtn-momo-api-key
MTN_MOMO_API_USER=your-mtn-user
MTN_MOMO_ENVIRONMENT=sandbox
MTN_MOMO_COLLECTION_PRIMARY_KEY=your-collection-key
MTN_MOMO_PROVIDER_CALLBACK_HOST=http://localhost:5000

# Payment Providers - Airtel Money
AIRTEL_MONEY_API_KEY=your-airtel-api-key
AIRTEL_MONEY_ENVIRONMENT=sandbox
AIRTEL_MONEY_CLIENT_ID=your-client-id
AIRTEL_MONEY_CLIENT_SECRET=your-client-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=10000
```

### Frontend (.env.development)

Create a `.env.development` file in the `frontend/` directory:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Running the Application

### Development Mode

#### Terminal 1 - Start Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

#### Terminal 2 - Start Frontend Development Server

```bash
cd frontend
npm run dev
# or for access from other machines on network:
npm run hostDev
```

The frontend will start on `http://localhost:5173`

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

#### Run Backend in Production

```bash
cd server
NODE_ENV=production npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset user password

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user details (admin)
- `GET /api/users` - List all users (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Courses
- `GET /api/courses` - List all courses (with pagination)
- `POST /api/courses` - Create course (instructor/admin)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (instructor/admin)
- `GET /api/courses/:id/modules` - Get course modules
- `POST /api/courses/:id/modules` - Add module to course

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments` - Get user enrollments
- `GET /api/enrollments/:id` - Get enrollment details
- `DELETE /api/enrollments/:id` - Unenroll from course

### Lessons
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons` - Create lesson (instructor/admin)
- `PUT /api/lessons/:id` - Update lesson
- `DELETE /api/lessons/:id` - Delete lesson

### Meetings (Live Classes)
- `GET /api/meetings` - List meetings
- `POST /api/meetings` - Create meeting (instructor/admin)
- `GET /api/meetings/:id` - Get meeting details
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting
- `POST /api/meetings/:id/start` - Start meeting
- `POST /api/meetings/:id/end` - End meeting

### Quizzes
- `GET /api/quizzes` - List quizzes
- `POST /api/quizzes` - Create quiz (instructor/admin)
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes/:id/submissions` - Submit quiz responses
- `GET /api/quizzes/:id/results` - Get quiz results

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment (instructor/admin)
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/submissions` - Submit assignment
- `PUT /api/submissions/:id/grade` - Grade submission (instructor/admin)

### Grades
- `GET /api/grades` - Get user grades
- `GET /api/grades/:courseId` - Get course grades

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

### Certificates
- `GET /api/certificates` - Get user certificates
- `POST /api/certificates` - Generate certificate
- `GET /api/certificates/:id/download` - Download certificate PDF

### Reports
- `GET /api/reports/courses` - Course analytics
- `GET /api/reports/students` - Student performance analytics
- `GET /api/reports/enrollments` - Enrollment reports

### Admin
- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/courses` - Manage courses
- `GET /api/admin/payments` - Payment management

## Frontend Architecture

### Component Organization

```
components/
├── Auth/                 # Authentication components
├── Courses/             # Course-related components
├── Live/                # Live class components
├── Dashboard/           # Dashboard components
├── Admin/               # Admin-only components
└── Common/              # Shared components
```

### State Management (Zustand)

The frontend uses Zustand for global state management:

```javascript
// Example: User store
import create from 'zustand';

const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

### API Service Layer

All API calls are centralized in the `services/` directory:

```javascript
// Example: courseService.js
export const getCourses = async (page = 1, limit = 10) => {
  const response = await api.get('/courses', { params: { page, limit } });
  return response.data;
};
```

### Real-time Communication

Socket.IO integration for live updates:

```javascript
import { io } from 'socket.io-client';

const socket = io(process.env.VITE_SOCKET_URL);

// Listen to events
socket.on('meeting:started', (data) => {
  // Handle meeting start
});

// Emit events
socket.emit('attendance:mark', { meetingId, studentId });
```

## Backend Architecture

### Request Flow

```
Client Request
    ↓
Router (route/*)
    ↓
Middleware (validation, auth, error handling)
    ↓
Controller (business logic)
    ↓
Service (data processing)
    ↓
Database (PostgreSQL)
    ↓
Response
```

### Key Middleware

1. **Authentication Middleware** - Verifies JWT tokens
2. **Validation Middleware** - Validates request data using express-validator
3. **Error Handler** - Centralized error handling
4. **Rate Limiter** - Prevents abuse
5. **CORS** - Handles cross-origin requests
6. **Security Headers** - Applied via Helmet.js

### Database Schema

The PostgreSQL database includes tables for:

- `users` - User accounts and profiles
- `courses` - Course information
- `enrollments` - Student enrollments
- `lessons` - Course lessons
- `modules` - Course modules
- `quizzes` - Assessment quizzes
- `quiz_submissions` - Student quiz responses
- `assignments` - Course assignments
- `submissions` - Assignment submissions
- `grades` - Student grades
- `meetings` - Live class sessions
- `attendance` - Class attendance records
- `certificates` - Course certificates
- `payments` - Payment transactions
- `subscriptions` - Subscription records
- `messages` - User messages
- `notifications` - System notifications
- `announcements` - Course announcements

## Security Features

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Password hashing** using bcryptjs
- **Role-based access control** (RBAC) - Admin, Instructor, Student
- **Token refresh mechanism** for extended sessions
- **Remember me functionality** with extended expiration

### Input Validation & Sanitization
- **Express Validator** for input validation
- **XSS Protection** using xss-clean middleware
- **CORS** configuration for safe cross-origin requests

### HTTP Security
- **Helmet.js** for secure HTTP headers
- **Content Security Policy** (CSP) configured
- **Frame guards** and X-Frame-Options
- **Rate limiting** to prevent brute force attacks
- **HTTPS Ready** with proper certificate configuration

### File Upload Security
- **Multer** for safe file handling
- **File size limits** (10MB by default)
- **File type validation**
- **Secured upload directory** with proper permissions

### Database Security
- **SQL Injection Prevention** via parameterized queries
- **Connection pooling** for efficient resource management
- **Environment-based configuration** for credentials

## Real-time Communication

### Socket.IO Events

The application uses Socket.IO for real-time updates:

#### Class Events
- `meeting:started` - Meeting starts
- `meeting:ended` - Meeting ends
- `student:joined` - Student joins class
- `student:left` - Student leaves class

#### Attendance Events
- `attendance:mark` - Mark student attendance
- `attendance:updated` - Attendance updated

#### Notification Events
- `notification:send` - Send notification
- `announcement:broadcast` - Broadcast announcement

#### Messaging Events
- `message:new` - New message sent
- `message:read` - Message marked as read

## Payment Integration

### Supported Payment Methods

#### MTN Mobile Money (MoMo)
- Primary payment method for African markets
- Integration via MTN MoMo API
- Webhook verification for payment confirmation

#### Airtel Money
- Alternative payment method
- Support for Airtel Money wallets
- Callback handling for payment status

### Payment Flow

```
1. User initiates payment
2. Backend creates payment record
3. Payment gateway redirects to provider
4. Provider processes payment
5. Webhook callback confirms payment
6. System updates subscription/enrollment
```

## Database Setup

### Initialize Database

```bash
cd server
npm run setup-db
```

This creates all necessary tables and schemas.

### Seed Sample Data

```bash
npm run seed
```

Populates database with sample courses, users, and data.

### Database Migrations

When making schema changes, update the database setup script and run:

```bash
npm run setup-db
```

## Testing

### Run Backend Tests

```bash
cd server
npm test              # Run all tests once
npm run test:watch   # Run tests in watch mode
```

### Test Coverage

Tests cover:
- Authentication endpoints
- Authorization checks
- API route handlers
- Error handling
- Input validation

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Linux/Mac: Find process using port
lsof -i :5000

# Windows: Find process using port
netstat -ano | findstr :5000

# Kill process (get PID from above)
kill -9 <PID>
```

#### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database user has proper permissions

#### CORS Errors
- Verify CLIENT_URL in backend .env
- Check that frontend URL matches CLIENT_URL
- Ensure Socket.IO CORS configuration

#### LiveKit Connection Issues
- Verify LiveKit server is running
- Check API credentials in .env
- Confirm network connectivity to LiveKit

## Production Deployment

### Environment Setup
1. Use a managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
2. Set `NODE_ENV=production`
3. Generate strong JWT secrets
4. Configure production email service
5. Set up CDN for static assets

### Security Checklist
- [ ] Enable HTTPS/TLS
- [ ] Set secure CORS origins
- [ ] Configure rate limiting appropriately
- [ ] Enable database encryption
- [ ] Set up regular backups
- [ ] Configure logging and monitoring
- [ ] Review and update all dependencies

### Deployment Platforms
- **Heroku** - Easy deployment with buildpacks
- **AWS** - EC2, ECS, or Elastic Beanstalk
- **DigitalOcean** - App Platform or Droplets
- **Railway** - Modern deployment platform
- **Vercel** (Frontend) - Optimized for Next.js but works with React

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support & Contact

For questions, issues, or suggestions:

- 📧 Email: ancosamfranco250@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Anco-Sam-Franco-B/LIVE-CLASSROOM/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Anco-Sam-Franco-B/LIVE-CLASSROOM/discussions)

---

**Last Updated**: 2026-06-30  
**Version**: 1.0.0  
**Status**: Active Development
