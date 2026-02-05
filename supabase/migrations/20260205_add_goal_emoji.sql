-- Add emoji column to goals table
-- This allows each goal to have a visual emoji icon displayed on goal cards

ALTER TABLE goals
ADD COLUMN emoji TEXT DEFAULT '🎯';

-- Set default emoji for existing goals
UPDATE goals
SET emoji = '🎯'
WHERE emoji IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN goals.emoji IS 'Emoji icon displayed on goal card (required, defaults to target 🎯)';
