#!/bin/bash

# Supabase Database Setup Script
# This script will help you create the required tables for BananaEdit

echo "🍌 BananaEdit - Supabase Database Setup"
echo "=========================================="
echo ""
echo "📝 SQL Script to Execute:"
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Visit Supabase SQL Editor:"
echo "   https://supabase.com/dashboard/project/grkozghqypwoahlkvvwa/sql/new"
echo ""
echo "2. Login to your Supabase account"
echo ""
echo "3. Copy and execute the SQL below:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat << 'EOF'
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

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger for updated_at
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

-- Usage records table
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

-- Enable RLS
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own usage records"
  ON public.usage_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage records"
  ON public.usage_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS usage_records_user_id_idx ON public.usage_records(user_id, created_at DESC);

-- Recharge records table
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

-- Enable RLS
ALTER TABLE public.recharge_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own recharge records"
  ON public.recharge_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recharge records"
  ON public.recharge_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS recharge_records_user_id_idx ON public.recharge_records(user_id, created_at DESC);
EOF
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4. After running the SQL, verify the tables were created:"
echo "   Go to Table Editor in the left sidebar"
echo "   You should see: profiles, usage_records, recharge_records"
echo ""
echo "✅ Setup complete!"
echo ""
echo "Your features will now work:"
echo "  • Wallet with 100 initial credits for new users"
echo "  • Usage history tracking"
echo "  • Recharge records"
