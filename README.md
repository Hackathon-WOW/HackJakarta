# MSME Investment Platform

A modern investment platform connecting investors with promising Micro, Small, and Medium Enterprises (MSMEs/UMKM). Built with a decoupled architecture using TypeScript, featuring AI-powered financial document analysis.

## Architecture

```
├── client/          # Next.js 14 frontend (TypeScript)
├── server/          # Express.js API backend (TypeScript)
```

## Features

### Three User Roles
- **MSME (Business Owner)**: Create profiles, upload financial documents, view AI-extracted analytics
- **Investor**: Browse verified MSMEs, analyze financial data, view investment opportunities
- **Admin**: Verify MSME profiles, manage users, monitor platform activity

### AI-Powered Document Processing
- Upload financial documents (PDF, images)
- GPT-4o extracts structured financial data
- Review and confirm extracted data
- Transform unstructured documents into actionable insights

### Financial Analytics
- Revenue and expense tracking
- Profit margin analysis
- Growth trend visualization
- Interactive charts with Recharts

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Recharts for data visualization
- React Dropzone for file uploads

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- OpenAI GPT-4o integration

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Setup Backend

```bash
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and OpenAI key

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

### Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

### Server (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile

### MSME Routes
- `POST /api/msme/profile` - Create/update profile
- `GET /api/msme/profile/me` - Get own profile
- `POST /api/msme/reports/upload` - Upload financial document (AI processing)
- `POST /api/msme/reports/text` - Submit text for AI extraction
- `POST /api/msme/reports` - Submit financial report manually

### Investor Routes
- `GET /api/investor/msmes` - Discover verified MSMEs
- `GET /api/investor/msmes/search` - Search MSMEs
- `GET /api/investor/msmes/:id/analytics` - Get MSME analytics

### Admin Routes
- `GET /api/admin/users` - List all users
- `GET /api/admin/msmes/pending` - Get pending verifications
- `PATCH /api/admin/msmes/:id/verify` - Verify/reject MSME
- `GET /api/admin/stats` - Dashboard statistics

## Database Schema

### User
- id, email, password, role (ADMIN/MSME/INVESTOR)

### MSMEProfile
- companyName, description, address, verificationStatus
- ownerId (foreign key to User)

### FinancialReport
- revenue, expenses, netProfit, period
- documentUrl, rawData (AI-extracted)
- msmeId (foreign key to MSMEProfile)

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Protected API routes

## License

MIT
