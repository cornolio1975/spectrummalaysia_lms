-- Performance Indexes for dashboard and notifications

-- 1. Index for getUserNotifications() which queries by user_id and orders by created_at DESC
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at 
ON notifications (user_id, created_at DESC);

-- 2. Indexes for getDashboardStats() which filters these tables by status
CREATE INDEX IF NOT EXISTS idx_event_participants_status 
ON event_participants (status);

CREATE INDEX IF NOT EXISTS idx_event_sessions_status 
ON event_sessions (status);
