-- Add tags column to places table if it doesn't exist
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'places' and column_name = 'tags') then
        alter table places add column tags text[] default array[]::text[];
    end if;
end $$;

-- Update category check constraint if it exists (or just ensure application level handles it)
-- Ideally we would update the ENUM type if it's a native postgres enum, but often it's just a text check.
-- We will rely on application validation for now to avoid complex migration of existing data if not needed.
