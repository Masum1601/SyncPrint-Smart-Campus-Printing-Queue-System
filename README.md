# SyncPrint — Smart Campus Printing Queue System

A Next.js application for managing smart campus printing queues.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Clerk](https://clerk.com) for student authentication

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env.local` file with your Clerk keys:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start development server |
| `npm run build`| Build for production     |
| `npm run start`| Start production server  |
| `npm run lint` | Run ESLint               |

---

## Student Print Request Features

Three student user stories are implemented:

| User story | Route | What it does |
| ---------- | ----- | ------------ |
| Submit a print request | `/print` | Upload a document, choose printer settings, and submit to the queue |
| View all submitted requests | `/my-requests` | List every print job linked to the signed-in student |
| View request status | `/my-requests/[id]` | Show live status, ETA, progress, and job details |

All three features require the student to be signed in with Clerk.

---

## Data Storage (No Database Yet)

**This project does not use a real database for print requests.**

Print jobs are stored in a **local JSON file** on the server:

| Item | Detail |
| ---- | ------ |
| Storage type | File-based JSON (not PostgreSQL, MongoDB, Supabase, etc.) |
| File path | `data/print-requests.json` |
| Read/write logic | `src/lib/print-requests/store.ts` (Node.js `fs`) |
| Git | The JSON file is gitignored and created on first submission |

### How data is saved

1. Student submits a print job from `/print`.
2. The API route `POST /api/print-requests` receives the request.
3. `store.ts` reads the full array from `data/print-requests.json`, appends the new job, and writes the file back.
4. Each job is linked to the signed-in student via Clerk `userId`.

### What Clerk stores vs what this app stores

| System | What it stores |
| ------ | -------------- |
| **Clerk** | User accounts (sign-in, profile, email) |
| **JSON file** | Print requests (document, printer, status, pages, etc.) |

Clerk handles authentication only. Print request data lives in the JSON file until you connect a real database.

### Limitations of the current approach

- Works well for **local development** and demos.
- Data persists on your machine while running `npm run dev` or `npm start`.
- **Not recommended for production** — especially on serverless hosts (e.g. Vercel), where the filesystem may not persist between deployments or instances.
- No database features: relations, transactions, backups, or multi-server sharing.

### Moving to a real database later

Replace the functions in `src/lib/print-requests/store.ts` with database calls. Keep the same function signatures so the API and UI do not need major changes:

- `createPrintRequest(input, userId, ownerName)`
- `listPrintRequestsByUser(userId)`
- `getPrintRequestForUser(id, userId)`

---

## How To Wire Everything Up

### 1. Authentication (Clerk)

Clerk is already integrated in:

- `src/app/layout.tsx` — wraps the app with `ClerkProvider`
- `src/proxy.ts` — Clerk middleware for protected routes and API auth
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx`

Make sure `.env.local` contains valid Clerk keys before testing student flows.

### 2. Print request data layer (file store, not a database)

Core files:

| File | Purpose |
| ---- | ------- |
| `src/lib/print-requests/types.ts` | `PrintRequest` and input types |
| `src/lib/print-requests/store.ts` | Create, list, and fetch requests via `data/print-requests.json` |
| `src/lib/print-requests/utils.ts` | Status badges, formatting, timeline helpers |

There is **no database connection string** and **no ORM** in this project. All persistence goes through the JSON file above.

### 3. API routes

| Endpoint | Method | Purpose |
| -------- | ------ | ------- |
| `/api/print-requests` | `POST` | Submit a new print request |
| `/api/print-requests` | `GET` | List requests for the signed-in student |
| `/api/print-requests/[id]` | `GET` | Fetch one request status for the signed-in student |

All API routes use Clerk `auth()` and only return data for the current `userId`.

### 4. UI pages and components

| Layer | Files |
| ----- | ----- |
| Auth guard | `src/components/auth/RequireAuth.tsx` |
| Submit form | `src/components/print/PrintJobForm.tsx`, `src/app/print/page.tsx` |
| Request list | `src/components/print-requests/MyPrintRequests.tsx`, `src/components/print-requests/PrintRequestCard.tsx`, `src/app/my-requests/page.tsx` |
| Request status | `src/components/print-requests/PrintRequestStatusView.tsx`, `src/app/my-requests/[id]/page.tsx` |
| Navigation | `src/components/layout/SiteHeader.tsx`, `src/components/layout/SiteFooter.tsx` |

### 5. End-to-end student flow

1. Student signs in from the navbar.
2. Student opens `/print` and submits a document.
3. `PrintJobForm` sends `POST /api/print-requests`.
4. API saves the job in `data/print-requests.json` with the Clerk `userId`.
5. Student is redirected to `/my-requests/[id]` to view status.
6. Student can open `/my-requests` anytime to see all submitted jobs.

### 6. Swapping to a real database later

The current JSON file store is a placeholder. For production, connect PostgreSQL, MongoDB, Supabase, or another database and replace the implementations in `src/lib/print-requests/store.ts`. Keep the same function signatures:

- `createPrintRequest(input, userId, ownerName)`
- `listPrintRequestsByUser(userId)`
- `getPrintRequestForUser(id, userId)`

The API routes and UI components can stay unchanged.

---

## Manual Test Checklist

1. Sign in as a student.
2. Go to `/print`, upload a file, and submit.
3. Confirm redirect to `/my-requests/[id]`.
4. Go to `/my-requests` and confirm the job appears in the list.
5. Open a request and confirm status, ETA, and progress are shown.
6. Sign out and confirm `/my-requests` prompts for sign-in.
