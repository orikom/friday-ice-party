# Friday Pool Party

A community web application for managing events, members, and WhatsApp group notifications.

## Features

- **Authentication**: Email magic link authentication via NextAuth
- **Roles**: Admin and Member roles with role-based access control
- **Member Directory**: Searchable member profiles with contact information
- **Events**: Admin-created events with categories, images, and details
- **WhatsApp Integration**: Adapter pattern for WhatsApp notifications (mock, Meta, Twilio)
- **QR Codes**: Generate QR codes for event entry
- **Payments**: PayBox adapter stub (ready for future integration)
- **Image Uploads**: Local storage adapter (S3-ready)

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui + lucide-react icons
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth v5 (Email magic link)
- **Validation**: Zod + React Hook Form
- **QR Codes**: qrcode library
- **Timezone**: Asia/Jerusalem (default)

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## Setup

1. **Clone the repository** (if applicable)

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your values:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/friday_pool_party"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
   EMAIL_FROM="noreply@fridaypoolparty.com"

   WHATSAPP_PROVIDER="mock"
   WHATSAPP_API_TOKEN=""
   WHATSAPP_PHONE_NUMBER_ID=""
   WHATSAPP_FROM_NUMBER=""

   SITE_URL="http://localhost:3000"

   PAYMENTS_PROVIDER="none"
   STORAGE_PROVIDER="local"
   UPLOAD_DIR="public/uploads"
   ```

4. **Set up the database**:

   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed the database
   npm run db:seed
   ```

5. **Create uploads directory**:

   ```bash
   mkdir -p public/uploads
   ```

6. **Start the development server**:

   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## Default Credentials

After seeding, you can sign in with:

- **Email**: `admin@fridaypoolparty.com` (or whatever you set in `ADMIN_EMAIL`)
- **Method**: Magic link (check your email or use NextAuth dev email)

## Database Schema

The application uses Prisma with the following main models:

- `User` - Users (admins and members)
- `Group` - WhatsApp subgroups
- `Event` - Events created by admins
- `EventJoin` - Member event joins with QR codes
- `MemberGroup` - User-group relationships

## API Routes

- `POST /api/auth/invite` - Invite/add member (admin only)
- `GET /api/members?query=` - Search members
- `POST /api/events` - Create event (admin only)
- `GET /api/events` - List events
- `GET /api/events/[shortCode]` - Get event details
- `POST /api/events/[shortCode]/join` - Join event
- `POST /api/events/[shortCode]/notify` - Resend WhatsApp notifications (admin)
- `POST /api/uploads` - Upload image
- `GET /api/admin/groups` - List groups (admin)
- `POST /api/admin/groups` - Create group (admin)

## WhatsApp Adapters

The app uses an adapter pattern for WhatsApp integration:

1. **Mock** (default): Logs messages to console
2. **Meta**: Meta WhatsApp Cloud API (stub)
3. **Twilio**: Twilio WhatsApp API (stub)

To switch adapters, set `WHATSAPP_PROVIDER` in `.env`:

- `mock` - Mock adapter (logs only)
- `meta` - Meta WhatsApp Cloud API
- `twilio` - Twilio WhatsApp API

## Payment Adapters

PayBox integration is stubbed for future implementation:

- `none` (default) - No payments
- `paybox` - PayBox adapter (stub)

Set `PAYMENTS_PROVIDER` in `.env` to enable.

## Storage Adapters

Image uploads support multiple storage backends:

- `local` (default) - Local file storage in `public/uploads`
- `s3` - AWS S3 storage (stub)

Set `STORAGE_PROVIDER` in `.env` to switch.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma Client
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio

## Testing

Basic Playwright tests are included. Run with:

```bash
npx playwright test
```

## Deployment

The app is Vercel-ready. Make sure to:

1. Set all environment variables in Vercel dashboard
2. Run migrations in production
3. Seed initial admin user
4. Configure upload directory permissions

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── auth/              # Auth pages
│   ├── events/            # Event pages
│   └── members/           # Member directory
├── components/            # React components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and adapters
│   ├── messaging/         # WhatsApp adapters
│   ├── payments/          # Payment adapters
│   └── storage/           # Storage adapters
├── prisma/                # Prisma schema and migrations
└── public/                # Static files
```

## License

Private project - All rights reserved
