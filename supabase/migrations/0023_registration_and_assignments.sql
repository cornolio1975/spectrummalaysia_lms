-- Migration 0023: Registration and Assignments enhancements

-- 1. Create types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status_type') THEN
        CREATE TYPE approval_status_type AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');
    END IF;
END $$;

-- 2. Add approval_status to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS approval_status approval_status_type DEFAULT 'PENDING';

-- 3. Structured address for participants (Learners)
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS address_line_3 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Malaysia';

-- 4. Structured address and status for trainers
ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS address_line_1 TEXT,
ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
ADD COLUMN IF NOT EXISTS address_line_3 TEXT,
ADD COLUMN IF NOT EXISTS postcode TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state_id UUID REFERENCES states(id),
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Malaysia',
ADD COLUMN IF NOT EXISTS approval_status approval_status_type DEFAULT 'PENDING';

-- 5. Add assignment method to participant_nadi_assignments
ALTER TABLE participant_nadi_assignments
ADD COLUMN IF NOT EXISTS assignment_method TEXT DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS assignment_status TEXT DEFAULT 'ACTIVE';

-- 6. Assignment history table for logging course/NADI changes
CREATE TABLE IF NOT EXISTS assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'COURSE' or 'NADI_SITE'
  previous_id UUID,
  new_id UUID,
  previous_status TEXT,
  new_status TEXT,
  assignment_method TEXT,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_assignment_history_participant ON assignment_history(participant_id);
