# Quick Start Guide - Friday Ice Party

## ✅ What's Already Done

- ✅ Database setup and migrations
- ✅ Seed data (admin user + 3 sample members + 4 groups)
- ✅ Member directory working
- ✅ All pages and API routes implemented

## 🚀 Next Steps to Test the App

### 1. Set Up Email for Authentication

You need to configure email for magic link authentication. Choose one:

**Option A: Use NextAuth Dev Email (Easiest for Development)**

- Leave `EMAIL_SERVER` empty in `.env`
- NextAuth will log magic links to your console/terminal
- No email setup needed!

**Option B: Use Real SMTP (Gmail Example)**

```env
EMAIL_SERVER="smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587"
EMAIL_FROM="noreply@fridaypoolparty.com"
```

**Option C: Use a Service like Resend/SendGrid**

```env
EMAIL_SERVER="smtp://api:your-api-key@resend.smtp.resend.com:587"
EMAIL_FROM="noreply@yourdomain.com"
```

### 2. Sign In as Admin

1. Go to http://localhost:3000
2. Click "Sign In"
3. Enter: `admin@fridaypoolparty.com` (or your ADMIN_EMAIL)
4. Check your email/console for the magic link
5. Click the link to sign in

### 3. Create Your First Event

Once signed in as admin:

1. Click "Admin" in the navigation
2. Click "Create Event"
3. Fill in:
   - Title: "Friday Ice Party"
   - Description: "Join us for a fun evening!"
   - Category: "party"
   - Upload an image (optional)
   - Select WhatsApp groups to notify
   - Set date/time (optional)
4. Click "Create Event"

### 4. Test the Full Flow

1. **View Events**: Go to homepage, see your created event
2. **Join Event**: Click "View Event" → "Join Event" (will prompt login if not signed in)
3. **See QR Code**: After joining, view your QR code
4. **Member Search**: Go to Members page, search by name/city/occupation
5. **WhatsApp Notification**: Check your terminal/console - you'll see mock WhatsApp logs

## 🎯 Testing Checklist

- [ ] Sign in as admin (magic link)
- [ ] Create an event with image
- [ ] View event on homepage
- [ ] Sign in as member (create one via Admin → Members)
- [ ] Join event as member
- [ ] View QR code after joining
- [ ] Search members
- [ ] Check WhatsApp mock logs in console

## 📝 Admin Features to Try

- **Admin Dashboard** (`/admin`): View stats
- **Create Event** (`/admin/events/new`): Create events with images
- **Manage Members** (`/admin/members`): Invite new members
- **Manage Groups** (`/admin/groups`): Add WhatsApp groups

## 🔧 Configuration Notes

### WhatsApp Integration

- Currently using **Mock adapter** (logs to console)
- Check your terminal to see WhatsApp message logs
- To use real WhatsApp: Set `WHATSAPP_PROVIDER=meta` or `twilio` in `.env`

### Image Uploads

- Images are stored in `public/uploads/`
- Make sure the directory exists: `mkdir -p public/uploads`

### Default Admin Credentials

- Email: `admin@fridaypoolparty.com` (from seed)
- Sign in via magic link

## 🐛 Troubleshooting

**Can't sign in?**

- Check your email configuration in `.env`
- For dev, leave EMAIL_SERVER empty and check console for magic link
- Make sure `NEXTAUTH_SECRET` is set

**Events not showing?**

- Make sure you're signed in as admin
- Check browser console for errors
- Verify database connection

**Images not uploading?**

- Ensure `public/uploads/` directory exists
- Check file size (max 5MB)
- Verify `STORAGE_PROVIDER=local` in `.env`

## 📚 Next Steps for Production

1. Set up real email provider (Resend, SendGrid, etc.)
2. Configure WhatsApp adapter (Meta or Twilio)
3. Set up image storage (S3 or similar)
4. Configure PayBox for payments
5. Deploy to Vercel/Railway/etc.

## 🎉 You're All Set!

The app is ready to use! Start by signing in as admin and creating your first event.
