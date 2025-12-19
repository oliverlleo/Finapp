-- Fix DELETE/UPDATE policies for accounts (Cards)

DROP POLICY IF EXISTS "Users can delete accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update accounts" ON accounts;

CREATE POLICY "Enable delete for workspace members" ON accounts
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = accounts.workspace_id
  )
);

CREATE POLICY "Enable update for workspace members" ON accounts
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = accounts.workspace_id
  )
);
