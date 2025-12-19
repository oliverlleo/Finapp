-- Fix DELETE/UPDATE policies for categories and budgets

-- 1. Categories
DROP POLICY IF EXISTS "Users can delete categories" ON categories;
DROP POLICY IF EXISTS "Users can update categories" ON categories;

CREATE POLICY "Enable delete for workspace members" ON categories
FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = categories.workspace_id
  )
);

CREATE POLICY "Enable update for workspace members" ON categories
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = categories.workspace_id
  )
);

-- 2. Budgets (already fixed delete in previous turn, adding update)
DROP POLICY IF EXISTS "Users can update budgets" ON budgets;

CREATE POLICY "Enable update for workspace members" ON budgets
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = budgets.workspace_id
  )
);

-- 3. Transactions (adding update policy)
DROP POLICY IF EXISTS "Users can update transactions" ON transactions;

CREATE POLICY "Enable update for workspace members" ON transactions
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM workspace_members WHERE workspace_id = transactions.workspace_id
  )
  OR
  auth.uid() = user_id
);
