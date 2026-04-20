# Lamazi — Mental Health Therapy Platform

A full-stack mental health therapy booking platform with three separate projects sharing one Go backend.

## Architecture

```
mindcare/
├── backend/              # Go REST API (shared by both frontends)
│   ├── handlers/         # Route handlers
│   ├── middleware/        # JWT auth middleware
│   ├── models/           # Data models
│   ├── config/           # Configuration
│   └── db/               # SQL schema + seed data
├── client-frontend/      # React app for clients
├── admin-frontend/       # React app for admins
└── docker-compose.yml    # Orchestrates all 4 services
```

## Quick Start (Docker)

```bash
# 1. Clone and enter project
cd lamazi-admin

# 2. Copy environment file
cp .env.example .env
# Edit .env with your M-Pesa credentials

# 3. Start everything
docker-compose up --build

# Services will be available at:
# Client App:    http://localhost:3000
# Admin App:     http://localhost:3001
# Backend API:   http://localhost:8080
# PostgreSQL:    localhost:5432
```

## Demo Credentials

| Role      | Email                       | Password    |
|-----------|-----------------------------|-------------|
| Client    | john.doe@email.com          | password123 |
| Client    | jane.smith@email.com        | password123 |
| Therapist | sarah.j@therapist.com       | password123 |
| Therapist | michael.c@therapist.com     | password123 |
| Admin     | admin@mindcare.com          | admin123    |

## Local Development (without Docker)

### Backend
```bash
cd backend
# Install dependencies
go mod download

export JWT_SECRET="dev-secret"

# Start server
go run main.go
```

### Client Frontend
```bash
cd client-frontend
npm install
REACT_APP_API_URL=http://localhost:8080/api npm start
# Runs on http://localhost:3000
```

### Admin Frontend
```bash
cd admin-frontend
npm install
REACT_APP_API_URL=http://localhost:8080/api npm start
# Runs on http://localhost:3001
```

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new user/therapist |
| POST | /api/auth/login | Login (client/therapist/admin) |
| GET | /api/therapists | List all active therapists |
| GET | /api/therapists/:id | Get therapist profile + slots + reviews |
| POST | /api/payments/mpesa/callback | M-Pesa STK callback |

### Client (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/bookings | Create booking |
| GET | /api/bookings | List my bookings |
| GET | /api/bookings/:id | Get booking details |
| PUT | /api/bookings/:id/cancel | Cancel booking |
| POST | /api/bookings/:id/review | Leave review |
| POST | /api/payments/mpesa/initiate | Initiate M-Pesa STK push |
| POST | /api/payments/simulate/:booking_id | Simulate payment (dev only) |

### Therapist (requires JWT, therapist role)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/therapist/profile | Get my profile |
| PUT | /api/therapist/profile | Update profile |
| GET | /api/therapist/bookings | Get my bookings |
| POST | /api/therapist/slots | Add availability slot |

### Admin (requires JWT, admin role)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/dashboard | Dashboard stats + activity |
| GET | /api/admin/users | All users + therapists |
| PUT | /api/admin/users/:id/status | Update user status |
| GET | /api/admin/verification | Pending verifications |
| PUT | /api/admin/verification/:id/:action | Approve/reject therapist |
| GET | /api/admin/payouts | All payout requests |
| PUT | /api/admin/payouts/:id | Update payout status |
| GET | /api/admin/analytics | Platform analytics |
| GET | /api/admin/audit-logs | Audit log entries |

## M-Pesa Integration

The platform uses Safaricom's M-Pesa Paybill STK Push (Lipa Na M-Pesa Online API).

### Setup
1. Register at https://developer.safaricom.co.ke
2. Create an app to get Consumer Key & Consumer Secret
3. Get your Paybill Shortcode and Passkey
4. Set callback URL to a publicly accessible endpoint
5. Add credentials to `.env`

### Flow
1. Client selects M-Pesa as payment method
2. Backend calls `/api/payments/mpesa/initiate` with phone + amount
3. Safaricom sends STK push to customer's phone
4. Customer enters M-Pesa PIN
5. Safaricom calls `/api/payments/mpesa/callback`
6. Backend marks payment complete and confirms booking

### Development (Sandbox)
- Use test credentials from Safaricom Developer Portal
- Use Sandbox test phone: `254708374149`
- Or use `/api/payments/simulate/:booking_id` to skip M-Pesa in development

## Database Schema

Key tables:
- `users` — clients and admins
- `therapists` — therapist accounts (separate from users, with verification)
- `therapist_specialties` — many-to-many specialties
- `therapist_documents` — uploaded verification documents
- `availability_slots` — bookable time slots
- `bookings` — therapy session bookings
- `payments` — payment records with M-Pesa support
- `payout_requests` — therapist payout requests
- `reviews` — client reviews of sessions
- `audit_logs` — admin action audit trail

## Features

### Client App
- Browse and search verified therapists
- View therapist profiles, specialties, reviews
- Multi-step booking (date/time → payment → confirmation)
- M-Pesa STK Push payment integration
- View upcoming bookings and session history
- Leave reviews for completed sessions
- Emergency help resources

### Admin Dashboard
- Platform overview with key metrics
- User management (clients + therapists)
- Therapist verification workflow (approve/reject with documents)
- Payout management (approve/process/complete)
- Analytics & reports (revenue, bookings, user growth, specialty breakdown)
- Audit logs for all admin actions

## Security
- JWT authentication with role-based access control
- Passwords hashed with bcrypt (cost 12)
- Admin-only endpoints protected by role middleware
- CORS configured for specific frontend origins
