# ExpenseIQ - Enterprise Client

Corporate Expense & Approval Management Web Application built with Next.js (App Router), TypeScript, and Tailwind CSS.

## 🚀 Features (Phase 1: Foundation)
- **Corporate Multi-Role Authentication**: JWT-based authentication integrated with Express backend.
- **Role-Based Access Control (RBAC)**: Support for `ADMIN`, `DEPT_HEAD`, `MANAGER`, `FINANCE`, and `EMPLOYEE` roles.
- **Account Overview & Policy Governance**: Live profile inspection (`GET /api/v1/auth/me`), department assignment, and corporate approval rule guidance.
- **Staff Organization Directory**: Full-width directory with search, role filters, and administrative employee registration modal (`POST /api/v1/auth/register`).
- **Platform Infrastructure Telemetry**: Live database and backend health monitor (`GET /health`).
- **Full-Width Light Enterprise Theme**: Clean, responsive, full-width SaaS UI with zero gradients or dark-mode overrides.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Package Manager**: pnpm

## 📦 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create a `.env.local` file (or use `.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to access the client portal.

### 4. Build & Verification
```bash
pnpm lint
pnpm build
```
