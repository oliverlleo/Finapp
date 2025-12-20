-- Add recurring_group_id to transactions to support bulk deletion/edits of series

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS recurring_group_id UUID;
