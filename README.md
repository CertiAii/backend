# CertiAI Backend

Backend API for CertiAI - an AI-powered certificate verification system using OCR and deep learning to authenticate academic certificates.

## 🚀 Overview

This is a NestJS-based REST API that provides:

- **User Authentication** - JWT-based authentication with email verification and password reset
- **Certificate Verification** - Integration with ML service for certificate authenticity checking
- **Email Services** - Automated email delivery for verification codes and password resets
- **Database Management** - PostgreSQL with Prisma ORM for data persistence

**Live API:** https://certiaibackend-production.up.railway.app

## 🛠️ Tech Stack

- **Framework:** NestJS (Node.js/TypeScript)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** JWT + bcryptjs
- **Email:** Nodemailer (Gmail SMTP + Mailtrap fallback)
- **Validation:** class-validator, class-transformer
- **Deployment:** Railway

## 📋 Features

### Authentication Module

- User registration with email verification (6-digit code)
- Secure login with JWT tokens (HttpOnly cookies)
- Password reset flow with email verification
- Session management and token refresh
- Protected routes with guards

### Certificate Verification

- Upload certificates for AI-powered authenticity verification
- Integration with ML service (FastAPI + TensorFlow)
- Hybrid verification: OCR (70%) + CNN (30%)
- Certificate metadata extraction (name, ID, institution, date)
- Verification history tracking

### Email Service

- **Production:** Gmail SMTP for real email delivery
- **Development:** Resend SMTP for testing
- **Auto-detection:** Switches based on environment configuration
- Templates for verification codes and password resets

## 🔧 Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/dbname"

# JWT Authentication
JWT_SECRET="your-super-secure-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# ML Service
ML_SERVICE_URL="https://mlcertificateverifier-production.up.railway.app"

# Gmail SMTP (Production)
# Get App Password: https://myaccount.google.com/apppasswords
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-character-app-password"

# Mailtrap SMTP (Development - fallback if Gmail not configured)
MAILTRAP_HOST="smtp.mailtrap.io"
MAILTRAP_PORT="2525"
MAILTRAP_USER="your-mailtrap-user"
MAILTRAP_PASS="your-mailtrap-password"
FROM_EMAIL="hello@certiai.com"

# Resend (optional alternative)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

### Gmail Setup (for production emails)

1. Enable 2-Step Verification in your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Create an App Password for "Mail"
4. Add `GMAIL_USER` and `GMAIL_APP_PASSWORD` to `.env`

## 🚀 Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/signup              # Register new user
POST   /api/auth/verify-email        # Verify email with code
POST   /api/auth/signin              # Login user
POST   /api/auth/signout             # Logout user
POST   /api/auth/forgot-password     # Request password reset
POST   /api/auth/reset-password      # Reset password with code
GET    /api/auth/me                  # Get current user (protected)
```

### Health Check

```
GET    /                             # API health status
```

### Certificate Verification (Coming Soon)

```
POST   /api/verify/certificate       # Upload and verify certificate
GET    /api/verify/history           # Get verification history
GET    /api/verify/:id               # Get specific verification result
```

## 🗄️ Database Schema

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  isVerified        Boolean   @default(false)
  verificationCode  String?
  resetPasswordCode String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📦 Deployment (Railway)

### Prerequisites

- Railway account (https://railway.app)
- GitHub repository connected
- Supabase database provisioned

### Configuration Files

- `railway.json` - Build and deploy settings
- `nixpacks.toml` - Build configuration
- `Procfile` - Process management

### Deploy Steps

1. Connect GitHub repo to Railway
2. Add environment variables in Railway dashboard:
   - `DATABASE_URL`, `DIRECT_URL`
   - `JWT_SECRET`, `JWT_EXPIRES_IN`
   - `ML_SERVICE_URL`
   - `GMAIL_USER`, `GMAIL_APP_PASSWORD`
3. Deploy automatically on push to `main`

### Build Configuration

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── mail/                 # Email service module
│   │   ├── mail.service.ts
│   │   └── mail.module.ts
│   ├── prisma/               # Prisma service
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts         # Root module
│   └── main.ts               # Application entry point
├── prisma/
│   └── schema.prisma         # Database schema
├── test/                     # E2E tests
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
├── railway.json              # Railway config
└── README.md
```

## 🔐 Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens stored in HttpOnly cookies
- CORS enabled for frontend domain
- Environment variables for sensitive data
- Input validation on all endpoints
- Rate limiting (recommended for production)

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test direct connection
npx prisma db push

# Regenerate client
npx prisma generate
```

### Email Not Sending

- Check Gmail App Password (not regular password)
- Verify 2-Step Verification is enabled
- Check GMAIL_USER and GMAIL_APP_PASSWORD in .env
- Test with Mailtrap for development

### Build Failures

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Email: support@certiai.com

---

Built with ❤️ using NestJS
