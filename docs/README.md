# Fermidas Compliance Watch - Documentation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp env.example .env.local
# Edit .env.local and add required variables (see SETUP.md)
```

### 3. Set Up Database

```bash
# Run the complete migration
psql $DATABASE_URL < migrations/001_complete_schema_and_seed.sql

# Create admin user (see SETUP.md)
```

### 4. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3001/digital/compliance-watch

---

## Documentation Index

### Getting Started

- **[SETUP.md](./SETUP.md)** - Complete setup guide (environment variables, database, admin user)
- **[TESTING.md](./TESTING.md)** - Testing guide (free mode, paid mode, report generation)
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

### Technical Documentation

- **[DIGITAL_PRODUCTS_README.md](./DIGITAL_PRODUCTS_README.md)** - Complete technical reference
- **[DATABASE.md](./DATABASE.md)** - Database schema, migrations, and alter queries
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment (Vercel, cron jobs, payments)

---

## Key Features

- ✅ **Daily Report Generation** - Automated scraping and AI summarization
- ✅ **Payment Integration** - Nouvobanq MPGS (optional - can run in free mode)
- ✅ **Admin Dashboard** - Source management, kill switch, settings
- ✅ **Multi-language Support** - English and French ready
- ✅ **Email Notifications** - Daily reports sent to subscribers

---

## Quick Reference

### Required Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="[generate with: openssl rand -base64 32]"
RESEND_API_KEY="re_..."
OPENROUTER_API_KEY="sk-or-..."
CRON_SECRET="[generate with: openssl rand -base64 32]"
```

### Optional (for payments)

```env
MPGS_MERCHANT_ID="..."
MPGS_API_PASSWORD="..."
MPGS_GATEWAY_URL="https://na-gateway.mastercard.com"
MPGS_WEBHOOK_SECRET="..."
MPGS_SUCCESS_URL="..."
MPGS_CANCEL_URL="..."
```

**Note:** If MPGS variables are commented out, the app runs in **FREE MODE** for testing.

---

## Next Steps

1. Read **[SETUP.md](./SETUP.md)** for detailed setup instructions
2. Follow **[TESTING.md](./TESTING.md)** to test the application
3. Check **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** if you encounter issues
4. Review **[DIGITAL_PRODUCTS_README.md](./DIGITAL_PRODUCTS_README.md)** for technical details

---

## Support

For questions or issues:

1. Check the troubleshooting guide
2. Review inline code comments
3. Check database logs and application logs
