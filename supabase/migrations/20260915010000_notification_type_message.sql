-- Allow in-app notifications for direct messages.
ALTER TYPE public.notification_type ADD VALUE IF NOT EXISTS 'message';
