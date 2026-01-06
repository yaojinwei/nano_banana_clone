#!/bin/bash

# Supabase Database Auto-Setup Script
# This script will automatically create the required tables

set -e

PROJECT_REF="grkozghqypwoahlkvvwa"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo "🍌 BananaEdit - Auto Creating Supabase Tables"
echo "=========================================="
echo ""
echo "📋 Project: $PROJECT_REF"
echo "🔗 URL: $SUPABASE_URL"
echo ""

# Read SQL from migration file
SQL_FILE="$(dirname "$0")/supabase/migrations/001_create_tables.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: SQL file not found at $SQL_FILE"
    exit 1
fi

echo "✅ Found SQL file: $SQL_FILE"
echo ""

# Try Method 1: Using psql (if available)
if command -v psql &> /dev/null; then
    echo "🔧 Method 1: Trying psql..."
    echo "⚠️  Requires database connection string"
    echo "   Format: postgresql://postgres:[YOUR-PASSWORD]@db.${PROJECT_REF}.supabase.co:5432/postgres"
    echo ""
    read -p "Enter your database connection string (or press Enter to try next method): " DB_URL

    if [ ! -z "$DB_URL" ]; then
        echo "⚙️  Executing SQL via psql..."
        psql "$DB_URL" -f "$SQL_FILE" && {
            echo "✅ Tables created successfully via psql!"
            echo ""
            echo "📊 Created tables:"
            echo "   • profiles"
            echo "   • usage_records"
            echo "   • recharge_records"
            exit 0
        }
    fi
fi

# Try Method 2: Using Supabase CLI
if command -v supabase &> /dev/null; then
    echo ""
    echo "🔧 Method 2: Trying Supabase CLI..."
    supabase db push --project-ref "$PROJECT_REF" --db-url "postgresql://postgres:${PROJECT_REF}@db.${PROJECT_REF}.supabase.co:5432/postgres" && {
        echo "✅ Tables created successfully via Supabase CLI!"
        echo ""
        echo "📊 Created tables:"
        echo "   • profiles"
        echo "   • usage_records"
        echo "   • recharge_records"
        exit 0
    } || echo "⚠️  Supabase CLI failed, trying next method..."
fi

# Try Method 3: Using Node.js and Supabase REST API
echo ""
echo "🔧 Method 3: Trying Node.js with Supabase REST API..."
echo "⚠️  Requires service_role key"

# Check if service_role key is available
SERVICE_ROLE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY" .env.local 2>/dev/null | cut -d'=' -f2)

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo ""
    echo "❌ Could not find service_role key in .env.local"
    echo ""
    echo "📝 To get your service_role key:"
    echo "   1. Visit: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
    echo "   2. Copy 'service_role (secret)' key"
    echo "   3. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your-key-here"
    echo ""
    echo "   Or run this command:"
    echo "   echo 'SUPABASE_SERVICE_ROLE_KEY=your-key-here' >> .env.local"
    exit 1
fi

echo "✅ Found service_role key"
echo ""

# Create temporary Node.js script
cat > /tmp/create-tables.js << 'EOFSCRIPT'
const https = require('https');

const SQL = `
-- User profiles table with credits balance
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  credits_balance INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text_to_image', 'image_to_image')),
  model TEXT NOT NULL CHECK (model IN ('nano_banana', 'nano_banana_pro', 'seedream_4')),
  prompt TEXT,
  image_url TEXT,
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage records"
  ON public.usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage records"
  ON public.usage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS usage_records_user_id_idx ON public.usage_records(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.recharge_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  payment_method TEXT,
  payment_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.recharge_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recharge records"
  ON public.recharge_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recharge records"
  ON public.recharge_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS recharge_records_user_id_idx ON public.recharge_records(user_id, created_at DESC);
`;

const url = process.argv[2];
const key = process.argv[3];

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Prefer': 'return=minimal'
  },
  body: JSON.stringify({ query: SQL })
};

const req = https.request(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Tables created successfully via REST API!');
      console.log('');
      console.log('📊 Created tables:');
      console.log('   • profiles');
      console.log('   • usage_records');
      console.log('   • recharge_records');
    } else {
      console.error('❌ Error:', res.statusCode, data);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
  process.exit(1);
});

req.write(JSON.stringify({ query: SQL }));
req.end();
EOFSCRIPT

echo "⚙️  Executing SQL via REST API..."
node /tmp/create-tables.js "${SUPABASE_URL}/rest/v1/rpc/exec_sql" "$SERVICE_ROLE_KEY" && {
    echo ""
    echo "✅ Success! All tables have been created."
    exit 0
}

# If all methods fail, provide manual instructions
echo ""
echo "❌ Could not auto-create tables using available methods"
echo ""
echo "📝 Manual setup required. Please:"
echo "   1. Visit: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo "   2. Copy the SQL from: $SQL_FILE"
echo "   3. Paste and click 'Run'"
echo ""
echo "Or add your service_role key to .env.local:"
echo "   echo 'SUPABASE_SERVICE_ROLE_KEY=your-key-here' >> .env.local"
echo "   Then run this script again."
exit 1
