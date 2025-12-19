-- Fix DELETE policies for transactions and budgets

-- 1. Transactions Table
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
DROP POLICY IF EXISTS "Workspace members can delete transactions" ON transactions;

CREATE POLICY "Enable delete for workspace members" ON transactions
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = transactions.workspace_id
  )
  OR
  auth.uid() = user_id
);

-- 2. Budgets Table
DROP POLICY IF EXISTS "Users can delete budgets" ON budgets;

CREATE POLICY "Enable delete for workspace members" ON budgets
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = budgets.workspace_id
  )
);
