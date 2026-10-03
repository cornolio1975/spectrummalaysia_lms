-- RUN THIS FIRST (Batch 1)
-- ====================================================
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('pending', 'active', 'inactive');
    END IF;
END$$;
-- ====================================================


-- THEN, RUN THIS SECOND (Batch 2)
-- ====================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_status account_status NOT NULL DEFAULT 'pending';

-- Update existing profiles to active so we don't break existing users
UPDATE public.profiles SET account_status = 'active' WHERE role != 'guest';

-- Modify default role for new profiles
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'guest';

-- Update the trigger to handle new registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, account_status)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'guest',
    'pending'
  );
  RETURN NEW;
END;
$$;
-- ====================================================
