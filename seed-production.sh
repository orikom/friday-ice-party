#!/bin/bash

# Safe seed script for production database
# This script adds initial data (admin user, groups, sample members)

echo "🌱 Safe Production Seed Script"
echo "==============================="
echo ""
echo "This script will:"
echo "  ✅ Create admin user"
echo "  ✅ Create default groups (party, yoga, mingling, business)"
echo "  ✅ Create sample members (for testing)"
echo "  ✅ Use upsert (won't duplicate if already exists)"
echo ""

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Usage:"
    echo "  DATABASE_URL='your-connection-string' ./seed-production.sh"
    echo ""
    echo "Or:"
    echo "  export DATABASE_URL='your-connection-string'"
    echo "  ./seed-production.sh"
    echo ""
    exit 1
fi

# Show what database we're connecting to (without showing password)
DB_INFO=$(echo "$DATABASE_URL" | sed 's/:[^:@]*@/:***@/g')
echo "📊 Connecting to: $DB_INFO"
echo ""

# Ask for confirmation
read -p "⚠️  Are you sure you want to seed PRODUCTION database? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Seed cancelled"
    exit 0
fi

echo ""
echo "🌱 Running seed..."
echo ""

# Run seed
npm run db:seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed completed successfully!"
    echo ""
    echo "Created:"
    echo "  - Admin user (check ADMIN_EMAIL env var or default: admin@fridaypoolparty.com)"
    echo "  - Default groups: party, yoga, mingling, business"
    echo "  - Sample members (for testing)"
    echo ""
    echo "You can now sign in with the admin email using magic link!"
else
    echo ""
    echo "❌ Seed failed. Please check the error above."
    exit 1
fi

