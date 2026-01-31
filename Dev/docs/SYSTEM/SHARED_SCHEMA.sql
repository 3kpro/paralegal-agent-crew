-- ==========================================
-- SHARED DATABASE INFRASTRUCTURE
-- ==========================================
-- Purpose: Unified identity and access management for 21 products.
-- Run this in the Supabase SQL Editor.

-- ==========================================
-- 1. SCHEMAS
-- ==========================================
CREATE SCHEMA IF NOT EXISTS reviewlens; -- Idea 11 (FairMerge)
CREATE SCHEMA IF NOT EXISTS cloud_ledger;
CREATE SCHEMA IF NOT EXISTS marketplace;

-- ==========================================
-- 2. PUBLIC IDENTITY (Shared across all products)
-- ==========================================

-- Profiles table to store public user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 3. PERMISSIONS & ROLE MANAGEMENT
-- ==========================================

CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'viewer');

-- Table to map users to products and roles
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_code TEXT NOT NULL, -- e.g. 'reviewlens', 'cloud-ledger'
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_code)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own permissions"
  ON public.user_permissions FOR SELECT
  USING (auth.uid() = user_id);

-- ==========================================
-- 4. PRODUCT-SPECIFIC MAPPING (ReviewLens / FairMerge)
-- ==========================================

-- Organizations/Teams for ReviewLens
CREATE TABLE IF NOT EXISTS reviewlens.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memberships for ReviewLens
CREATE TABLE IF NOT EXISTS reviewlens.members (
  org_id UUID REFERENCES reviewlens.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role DEFAULT 'user',
  PRIMARY KEY (org_id, user_id)
);

ALTER TABLE reviewlens.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewlens.members ENABLE ROW LEVEL SECURITY;

-- Org Policies
CREATE POLICY "Members can view their orgs"
  ON reviewlens.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviewlens.members 
      WHERE org_id = reviewlens.organizations.id 
      AND user_id = auth.uid()
    )
  );

-- ==========================================
-- 5. CROSS-PRODUCT SYNC LOGIC
-- ==========================================

-- Function to handle profile updates (e.g. status changes)
-- This triggers logic across other schemas if they need local copies of data
CREATE OR REPLACE FUNCTION public.on_profile_updated() 
RETURNS TRIGGER AS $$
BEGIN
  -- Perform Cross-Product Actions
  
  -- Example: If status becomes active, ensure they have a basic permission entry
  IF (NEW.subscription_status = 'active' AND (OLD.subscription_status IS NULL OR OLD.subscription_status <> 'active')) THEN
    INSERT INTO public.user_permissions (user_id, product_code, role)
    VALUES (NEW.id, 'all', 'user')
    ON CONFLICT (user_id, product_code) DO NOTHING;
  END IF;

  -- Example: Propagate update to ReviewLens members table if specific logic needed
  -- UPDATE reviewlens.members SET role = NEW.role ... 

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_profile_updated_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.on_profile_updated();

