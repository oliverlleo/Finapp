-- Fix INSERT policies for all major tables

-- 1. Transactions
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;

CREATE POLICY "Enable insert for workspace members" ON transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- 2. Categories
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON categories;
DROP POLICY IF EXISTS "Users can insert categories" ON categories;

CREATE POLICY "Enable insert for workspace members" ON categories
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = categories.workspace_id
    AND user_id = auth.uid()
  )
);

-- 3. Budgets
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON budgets;
DROP POLICY IF EXISTS "Users can insert budgets" ON budgets;

CREATE POLICY "Enable insert for workspace members" ON budgets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = budgets.workspace_id
    AND user_id = auth.uid()
  )
);

-- 4. Accounts (Cards)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON accounts;
DROP POLICY IF EXISTS "Users can insert accounts" ON accounts;

CREATE POLICY "Enable insert for workspace members" ON accounts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = accounts.workspace_id
    AND user_id = auth.uid()
  )
);
