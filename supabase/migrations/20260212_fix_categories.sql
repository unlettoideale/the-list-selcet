-- Add missing categories to the enum
ALTER TYPE "public"."category_enum" ADD VALUE IF NOT EXISTS 'ROOFTOP';
ALTER TYPE "public"."category_enum" ADD VALUE IF NOT EXISTS 'BREAKFAST_BAR';
ALTER TYPE "public"."category_enum" ADD VALUE IF NOT EXISTS 'COCKTAIL_BAR';

-- Verify constraints
-- (This part is just for documentation, Supabase handles check constraints automatically for Enums usually)
