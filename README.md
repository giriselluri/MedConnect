# MedConnect AI — Healthcare & Life Sciences Professional Network

MedConnect AI is a LinkedIn-inspired professional networking and clinical evidence platform designed specifically for doctors, researchers, medical students, pharmaceutical professionals, and healthcare leaders.

It enables clinicians to connect, share peer-reviewed insights, discover medical research, participate in specialty-specific communities, explore interactive educational case studies, and synthesize clinical studies with an integrated AI Research Assistant.

---

## 🌟 Key Features

1. **LinkedIn-Inspired Healthcare SaaS UI**
   - Clean, accessible desktop 3-column layout (Profile/Navigation Left, Feed Center, Colleagues/Topics Right) and responsive mobile experience.
   - Deep navy typography (`#0f172a`), crisp white surfaces, and restrained clinical teal accents (`#0d9488`).

2. **Social Feed & Peer Exchange**
   - Real-time post composer with clinical specialty tags, topic hashtags (`#TAVR`, `#POCUS`), and attached scientific article link previews.
   - Endorsements (likes), threaded peer comments, share actions, and bookmarking.
   - Instant optimistic updates without full page reloads.

3. **Case Study Management (Critical Clinical Feature)**
   - **Admin Capabilities:** Author, edit, assign multi-specialty tags (Cardiology, Oncology, Neurology, Pediatrics, Dermatology, Internal Medicine, etc.), draft, publish, and archive educational cases.
   - **End-User Discovery:** Public feed shows **only** published case studies; supports keyword search and canonical multi-specialty filtering. Draft and archived cases remain private to administrators.
   - Detailed clinical case view featuring clinical presentations, diagnostic evaluations, management rationales, learning objectives, and source guidelines.

4. **Departmental Communities & Groups**
   - Dedicated forums for Cardiology, Oncology Research, Clinical Research, Pharmaceutical Industry, Medical Students, and Healthcare AI.
   - Member count tracking, persisted join/leave actions, and group-specific discussion feeds.

5. **Medical News & Journals Wire**
   - Traceable medical headlines from FDA releases, NEJM Watch, JACC, and Lancet alerts.
   - Search by keyword and filter by clinical specialty.
   - One-click shortcut to synthesize any study directly in the AI Research Assistant.

6. **Gemini-Powered AI Research Assistant**
   - Server-side endpoint (`/api/ai/research-summary`) that parses study abstracts or preprints.
   - Structured clinical evidence extraction: Plain-Language Summary, Research Hypothesis, Methodology, Quantitative Findings, Limitations, Discussion Questions for Hospital Rounds, and Keywords.
   - Actions to copy summary, save sessions, and convert syntheses directly into draft professional feed posts.
   - Built-in Protected Health Information (PHI) guard and strict clinical disclaimer.

7. **Admin Portal & Governance**
   - Real-time platform metrics (Total Users, Published Cases, Drafts, Archived Cases, Social Posts, Groups).
   - User role administration and role-based access control (RBAC).
   - Content and peer conduct moderation queue.
   - Server-side admin verification protecting privileged actions.

8. **Fictional Seed Profiles & Demo Switcher**
   - 10 fictional personas covering Cardiology, Oncology, Neurology, Pediatrics, Dermatology, Internal Medicine, Genomic Research, Medical Students, and Pharmaceutical Medical Affairs.
   - 1-click persona switcher to test different roles and admin permissions without exposing privileged credentials.

---

## 🏗️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **Database:** Supabase PostgreSQL with Row Level Security (RLS) & local persistent fallback
- **Authentication:** Supabase Auth & Role-Based Access Control (RBAC)
- **AI Model:** Google Gemini (`@google/generative-ai`) with intelligent rule-based clinical parser fallback
- **Deployment:** Vercel & GitHub

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/your-username/MedConnectAI.git
cd MedConnectAI
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Google Gemini AI API Key
GEMINI_API_KEY=your-gemini-api-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Note on Local / Demo Mode:** If Supabase credentials or Gemini API keys are omitted, the application automatically runs in high-fidelity demo mode with persistent server-side storage in `.data/medconnect_db.json`. All CRUD operations, case publishing workflows, filters, and AI summaries work immediately out of the box.

### 4. Database Setup (Supabase PostgreSQL)
When connecting to a live Supabase project:
1. Open your Supabase Dashboard SQL Editor.
2. Execute the schema migration in `supabase/schema.sql`.
3. (Optional) Run the seed script in `supabase/seed.sql` to populate fictional profiles, case studies, and communities.

### 5. Running the Application
```bash
# Run local development server
npm run dev

# Run production build
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Acceptance Test Verification (Section 8)

To verify the mandatory end-to-end case study lifecycle:
1. Open the app and ensure you are signed in as **Dr. Sarah Jenkins (Admin)** via the top "Demo Persona" switcher.
2. Navigate to **Admin Portal -> Case Studies Management -> Create New Case Study** (`/admin/case-studies/new`).
3. Set the Title to: `Illustrative Cardiology Case Study`.
4. Tag it with the **Cardiology** specialty tag.
5. Provide summary, educational content, and click **Publish Case Study**.
6. Switch persona to a standard user (e.g., **Dr. Marcus Chen** or **Alex Rivera**).
7. Navigate to **Case Studies** (`/case-studies`).
8. Select the **Cardiology** filter pill.
9. **Result:** The newly published `Illustrative Cardiology Case Study` appears immediately.
10. Click **Review Case** to view the full clinical case.
11. Observe that internal drafts and archived cases do not appear in normal user results.

---

## 🔒 Security & Medical Ethics

- **PHI Protection:** The AI Research Assistant actively rejects input containing detected Protected Health Information (SSN, MRN, date of birth patterns).
- **Row Level Security (RLS):** Strict server-side policies restrict case study creation, modification, and deletion to authenticated administrators.
- **Educational Framing:** All synthetic case studies are explicitly labeled as illustrative educational examples and do not constitute individualized clinical advice.

---

## 🚢 Deployment to Vercel

1. Push your code to a GitHub repository:
   ```bash
   git add .
   git commit -m "feat: MedConnect AI full-stack platform"
   git push origin main
   ```
2. Import the repository in the [Vercel Dashboard](https://vercel.com/new).
3. In Project Settings, set the Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`).
4. Click **Deploy**. Vercel will automatically build and deploy the Next.js App Router application.

---

## 📄 License
MIT License. Created for the MedConnect AI Product Manager Buildathon.
