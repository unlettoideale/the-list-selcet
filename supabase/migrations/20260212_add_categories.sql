
-- Create the category enum if it doesn't exist (it should, but good to be safe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_enum') THEN
        CREATE TYPE "public"."category_enum" AS ENUM ('RESTAURANT', 'HOTEL', 'BAR');
    END IF;
END $$;

-- Add new enum values individually to avoid errors if they already exist
ALTER TYPE "public"."category_enum" ADD VALUE IF NOT EXISTS 'ROOFTOP';
ALTER TYPE "public"."category_enum" ADD VALUE IF NOT EXISTS 'BREAKFAST_BAR';
ALTER TYPE "public"."category_enum" ADD VALUE IF NOT EXISTS 'COCKTAIL_BAR';

-- Drop the existing constraint if it exists to allow the new values
ALTER TABLE "public"."places" DROP CONSTRAINT IF EXISTS "places_category_check";

-- Re-add the constraint (optional if column typed as enum, but good for explicit check)
-- CASE 1: If the column is NOT an ENUM type but a TEXT with a CHECK constraint
-- ALTER TABLE "public"."places" ADD CONSTRAINT "places_category_check" 
-- CHECK (category IN ('RESTAURANT', 'ROOFTOP', 'HOTEL', 'BREAKFAST_BAR', 'COCKTAIL_BAR', 'BAR'));

-- CASE 2: If the column IS an ENUM type, no check constraint is needed usually, 
-- but we might need to cast existing data or update the column type if it was text.
-- Assuming it is an enum column 'category' of type 'category_enum'.
