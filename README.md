
# AI Career Coach

AI Career Coach is a full-stack career development platform built with Next.js that helps users prepare for job applications with AI-assisted resumes, cover letters, interview practice, and personalized career guidance.

Live app: https://capstone2-mauve.vercel.app/

## Overview

This project combines authentication, AI workflows, and a PostgreSQL database to give users a single place to:

- build and manage multiple role-specific resumes
- generate AI-powered cover letters
- practice technical interviews with adaptive quiz feedback
- track career progress from a personalized dashboard
- submit product feedback inside the app

The app is deployed on Vercel and uses Clerk for authentication, Prisma with PostgreSQL for data access, and Google Gemini for AI generation.

## Features

- Multi-resume support with saved resume library, role targeting, and resume selection
- Resume builder with structured sections, markdown preview, and PDF export
- AI resume bullet improvement for stronger, more measurable experience descriptions
- AI-generated cover letters tailored to job title, company, and job description
- Technical interview quiz generation based on the user's industry and skills
- Quiz result analysis with improvement tips and recommendation summaries
- Protected dashboard and authenticated user flows with Clerk
- Feedback collection API and UI for capturing user suggestions
- Responsive UI built with Next.js App Router, Tailwind CSS, and Radix UI components

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS
- Clerk Authentication
- Prisma ORM
- PostgreSQL
- Google Gemini API
- Radix UI
- React Hook Form + Zod
- Vercel

## Project Structure

```text
app/                    Next.js App Router pages and API routes
actions/                Server actions for AI, resume, interview, and user flows
components/             Shared UI components
lib/                    Utilities, Prisma client, recommendation helpers, templates
prisma/                 Prisma schema and migrations
data/                   Static content used by the landing page
```

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Create a `.env` file

Add the environment variables used by the app:

```env
DATABASE_URL=
GEMINI_API_KEY=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Optional Clerk-related values referenced in the codebase
CLERK_API_KEY=
CLERK_API_SECRET=
NEXT_PUBLIC_CLERK_API_KEY=
```

### 3. Generate Prisma client and apply database changes

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development, you can also use:

```bash
npx prisma migrate dev
```

### 4. Start the development server

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Database Models

The Prisma schema currently includes:

- `User`
- `Assessment`
- `Resume`
- `CoverLetter`
- `IndustryInsight`
- `Feedback`

## Deployment

The application is deployed on Vercel:

- Production URL: https://capstone2-mauve.vercel.app/

To deploy your own copy:

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add the required environment variables.
4. Connect a PostgreSQL database.
5. Run Prisma migrations for the production database.

## Highlights

- Uses server actions for core business workflows
- Protects app routes with Clerk middleware
- Stores persistent user data in PostgreSQL
- Generates personalized content with Gemini
- Supports multiple saved resumes per user

## Author

Built by Karthik.
