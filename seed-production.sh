#!/bin/bash

# Safe seed script for production database
# This script adds initial data (admin user, groups, sample members)

echo "🌱 Safe Production Seed Script"
echo "==============================="
echo ""
echo "This script will:"
echo "  ✅ Create/Update admin user (admin@fridaypoolparty.com / password: 1234)"
echo "  ✅ Create/Update test user (user@fridaypoolparty.com / password: 1234)"
echo "  ✅ Create default groups (party, yoga, mingling, business)"
echo "  ✅ Create 10 Israeli members with Hebrew descriptions"
echo "  ✅ Use upsert (won't duplicate if already exists, will update passwords)"
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
    echo "  - Admin user: admin@fridaypoolparty.com (password: 1234)"
    echo "  - Test user: user@fridaypoolparty.com (password: 1234)"
    echo "  - Default groups: party, yoga, mingling, business"
    echo "  - 10 Israeli members with Hebrew descriptions (all password: 1234)"
    echo ""
    echo "You can now sign in with email and password!"
else
    echo ""
    echo "❌ Seed failed. Please check the error above."
    exit 1
fi

