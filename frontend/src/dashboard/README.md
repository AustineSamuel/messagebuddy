# MessageBuddy Dashboard
## WhatsApp AI Agent – Frontend Module

A fully-featured dark-themed WhatsApp AI agent dashboard for Nigerian businesses.
Drop this into your existing Next.js 14 project.

---

## 📁 Folder Structure

```
src/
├── app/
│   ├── layout.tsx              ← Root layout (imports globals.css)
│   ├── page.tsx                ← Redirects / → /dashboard
│   └── dashboard/
│       └── page.tsx            ← Dashboard entry
├── components/
│   ├── ui/
│   │   └── primitives.tsx      ← Avatar, Badge, Toggle, FormInput, etc.
│   ├── dashboard/
│   │   ├── Sidebar.tsx         ← Left nav with 4 sections
│   │   ├── DashboardLayout.tsx ← Root layout assembler
│   │   └── DashboardAnalytics.tsx ← Credits & analytics page
│   ├── chat/
│   │   ├── ChatList.tsx        ← Left contact list
│   │   ├── ChatArea.tsx        ← Main message area
│   │   ├── MessageBubble.tsx   ← Individual message (click AI to edit)
│   │   ├── EditMessageModal.tsx ← Edit AI message overlay
│   │   └── RightPanel.tsx      ← Info / AI Rules / Credits tabs
│   ├── contacts/
│   │   └── ContactsPage.tsx    ← Always/Never/Custom rule assignment
│   └── settings/
│       └── SettingsPage.tsx    ← Business profile, AI rules, products
├── hooks/
│   └── useDashboardStore.ts    ← All state management in one hook
├── data/
│   └── demo.ts                 ← All demo data (swap for real API later)
├── types/
│   └── index.ts                ← TypeScript types
└── styles/
    └── globals.css             ← CSS variables, dark theme, animations
```

---

## 🚀 Quick Start (Standalone)

```bash
cd messagebuddy-dashboard
npm install
npm run dev
```

Open http://localhost:3000

---

## 🔗 Adding to an Existing Next.js Project

1. **Copy these folders** into your project's `src/`:
   - `components/dashboard/`
   - `components/chat/`
   - `components/contacts/`
   - `components/settings/`
   - `components/ui/`
   - `hooks/useDashboardStore.ts`
   - `data/demo.ts`
   - `types/index.ts`

2. **Copy CSS variables** from `styles/globals.css` into your existing globals.css

3. **Add the route**: Create `app/dashboard/page.tsx` with:
   ```tsx
   import DashboardLayout from "@/components/dashboard/DashboardLayout";
   export default function DashboardPage() {
     return <DashboardLayout />;
   }
   ```

4. **Verify** `tsconfig.json` has `"@/*": ["./src/*"]` path alias

---

## 🎨 Features

| Feature | Status |
|---|---|
| WhatsApp-style chat UI | ✅ |
| Click AI message to edit | ✅ |
| Contact list with unread badges | ✅ |
| AI status bar (active / disabled) | ✅ |
| Right panel: Contact info | ✅ |
| Right panel: AI writing rules | ✅ |
| Right panel: Credits usage | ✅ |
| Credits bar chart (7 days) | ✅ |
| Analytics dashboard | ✅ |
| Contact rules (Always/Never/Custom) | ✅ |
| Business profile settings | ✅ |
| Products catalog | ✅ |
| AI tone & language selector | ✅ |
| Escalation rules | ✅ |
| Global AI toggle | ✅ |
| Dark theme with CSS variables | ✅ |
| Responsive components | ✅ |
| TypeScript throughout | ✅ |
| Demo data (swap for real API) | ✅ |

---

## 🔌 Backend Integration Points

All demo data lives in `src/data/demo.ts`. When your backend is ready:

- Replace `DEMO_CONTACTS` → `GET /api/contacts`
- Replace `DEMO_CONVERSATIONS` → `GET /api/conversations/:contactId`
- Replace `DEMO_DAILY_CREDITS` → `GET /api/credits/usage`
- Replace `DEMO_PRODUCTS` → `GET /api/products`
- The `useDashboardStore` hook is where you add API calls

---

## 🏗️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS v4** (for utilities)
- **CSS Variables** (for theming — no external component library)
- **React hooks** (no Redux/Zustand needed)

---

Built for Nigerian e-commerce businesses using WhatsApp as their primary sales channel.
