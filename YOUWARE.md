# YOUWARE.md

# Collaborative Financial Platform (SaaS)

This project is a Collaborative Financial Platform built with React, TypeScript, Vite, Tailwind CSS, and **Supabase**.

## Project Status

- **Current Phase**: Production Ready (Bug Fixes & Optimization)
- **Tech Stack**: 
  - Frontend: React 18, TypeScript, Vite, Tailwind CSS, Zustand, Recharts, Framer Motion.
  - Backend: **Supabase** (PostgreSQL, Auth, Realtime, Storage).

## Architecture

### Backend (Supabase)
- **Project ID**: `kevrmiyrkqirivbpgzkl`
- **Region**: `sa-east-1`
- **Database Schema**:
  - `profiles`: User profiles (linked to auth.users).
  - `workspaces`: Multi-tenancy units.
  - `workspace_members`: User roles in workspaces.
    - **New Columns**: `display_name`, `avatar_url` (Workspace-specific overrides).
  - `workspace_invites`: Pending email invites.
  - `categories`: Financial categories (supports hierarchy via `parent_id`).
  - `accounts`: Wallets and Credit Cards (supports `initial_balance`).
  - `transactions`: Income, Expense, Transfers (supports recurrence, installments, attachments, tags, beneficiary).
  - `budgets`: Monthly/Yearly spending limits per category (supports `rollover`).
- **Storage**:
  - Bucket: `attachments` (Public).
  - Bucket: `avatars` (Public).
  - Policies: Authenticated users can upload and view.

### State Management (Zustand)
The global state is managed by `useFinanceStore` (`src/store/useFinanceStore.ts`).
**Actions Implemented**:
- `fetchInitialData`: Loads all workspace data including new fields.
- `createTransaction`: Handles expenses, incomes, transfers, installments, recurrence.
- `createCard`: Adds credit card with initial balance.
- `createCategory`: CRUD for categories.
- `createInvite`: Sends email invites.
- `createWorkspace`: Creates new workspace and seeds categories (uses RPC `create_workspace`).
- `switchWorkspace`: Toggles current workspace context.
- `toggleTransactionStatus`: Reconciliation (pending/completed).
- `updateProfile`: Updates user profile (name, avatar) using upsert.
- `updateMemberProfile`: Updates workspace-specific member profile (display_name, avatar_url).
- `uploadAttachment`: Uploads files to Supabase Storage.
- `uploadAvatar`: Uploads profile images to Supabase Storage.

### Features Implemented
1.  **Authentication**: Login, Register, Profile (Upsert supported).
2.  **Dashboard**: Real-time summary and charts.
3.  **Transactions**:
    - Advanced CRUD (Attachments as Files, Tags, Recurrence End).
    - **Transfers**: Move money between accounts.
    - **Installments**: Auto-generate future transactions.
    - **Reconciliation**: Checkbox for status (Paid/Pending).
    - **Beneficiary**: Assign transactions to specific workspace members.
4.  **Receivables**: Dedicated page for income management with Beneficiary, File Upload, and Status (Received/Pending) support.
5.  **Cards**: Credit card management with initial balance.
6.  **Categories**: Full CRUD with subcategory support.
7.  **Budgets**: Monthly limits with rollover logic.
8.  **Collaboration**:
    - Email Invites.
    - Workspace Switching & Creation.
    - Role-based access (Admin/Member).
    - **Member Management**: Edit display name and avatar per workspace.
9.  **Realtime**: Live updates for all data.
10. **Settings**: Profile management with File Upload, Gallery (10 avatars), and Link options.

## Design System
- **Framework**: Tailwind CSS + Framer Motion.
- **Font**: Inter (Google Fonts).
- **Palette**: Zinc/Slate (Neutral) + Indigo/Emerald/Rose (Semantic).
- **Components**: Glassmorphism header, clean cards, smooth transitions.
- **Responsive Strategy**: Use **Card View** (vertical list) for mobile (`sm:hidden`) and **Table View** for desktop (`hidden sm:block`). Avoid horizontal scrolling tables on mobile.
- **Mobile Actions**: Ensure touch targets are large (min 44px recommended, or ample padding). Use text labels + icons for critical actions (e.g., "Pagar", "Receber") to improve intuitiveness.
- **Header**: Keep header elements compact on mobile (`h-16` fixed). Use `truncate`, smaller icons (`h-3`), and reduced padding (`px-2`) to prevent overlap.
- **Dropdowns**: Ensure dropdowns in the header align correctly (`left-0` for left-aligned items) to avoid clipping.
- **Notifications**: Implemented via `Notifications` component and `useFinanceStore`. Auto-generates alerts for overdue/due-today bills.

## Development Commands

- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint**: `npm run lint`

## Database & Security (RLS)

**Critical Policies**:
- **`workspaces`**: Users can view workspaces they are members of.
- **`workspace_members`**: Users can view members of workspaces they own OR are members of.
  - *Note*: Avoid recursive policies (e.g., `workspace_members` querying itself). Use `workspaces` table for membership checks where possible to prevent infinite recursion errors.
- **Storage**: Ensure `attachments` and `avatars` buckets exist and have proper RLS policies for authenticated users.

## Directory Structure

- `src/api`: API utilities (if any).
- `src/components`: Reusable UI components.
- `src/contexts`: React Contexts (Auth).
- `src/layouts`: Page layouts (Dashboard, Auth).
- `src/lib`: Supabase client configuration.
- `src/pages`: Application pages (Routes).
- `src/store`: Zustand store (`useFinanceStore`).
- `src/types`: TypeScript definitions.
