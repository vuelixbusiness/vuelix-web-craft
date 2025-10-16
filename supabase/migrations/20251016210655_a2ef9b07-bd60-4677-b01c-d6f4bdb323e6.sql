-- Add new roles to the user_roles enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'studio';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'festival_event';