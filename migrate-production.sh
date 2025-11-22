#!/bin/bash

# Safe migration script for production database
# This script only runs migrations - it does NOT deploy or modify code

echo "🔒 Safe Production Migration Script"
echo "===================================="
echo ""
echo "This script will:"
echo "  ✅ Apply database migrations to production"
echo "  ✅ Only create/update database structure"
echo "  ❌ NOT deploy your app"
echo "  ❌ NOT modify your code"
echo "  ❌ NOT delete any data"
echo ""

# Check if DATABASE_URL is provided
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Usage:"
    echo "  DATABASE_URL='your-connection-string' ./migrate-production.sh"
    echo ""
    echo "Or:"
    echo "  export DATABASE_URL='your-connection-string'"
    echo "  ./migrate-production.sh"
    echo ""
    exit 1
fi

# Show what database we're connecting to (without showing password)
DB_INFO=$(echo "$DATABASE_URL" | sed 's/:[^:@]*@/:***@/g')
echo "📊 Connecting to: $DB_INFO"
echo ""

# Ask for confirmation
read -p "⚠️  Are you sure you want to run migrations on PRODUCTION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🚀 Running migrations..."
echo ""

# Run migrations
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migrations completed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Check your Vercel logs to verify the app is working"
    echo "  2. Test your app to make sure everything works"
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi

