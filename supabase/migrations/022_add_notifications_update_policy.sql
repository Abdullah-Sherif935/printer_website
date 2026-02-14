-- Migration: Add UPDATE policy for notifications table
-- Allow users to update their own notifications (mark as read)

CREATE POLICY "Users can update own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
