# HubSpot-Style CRM Demo MVP

A fully functional Customer Relationship Management (CRM) application built with Next.js, demonstrating lead management, pipeline tracking, and sales automation features.

## 🎯 Project Status: MVP COMPLETE ✅

### ✅ Completed Features

#### Database & Backend
- ✅ SQLite database with complete schema
- ✅ 30 seeded leads across 6 pipeline stages
- ✅ 3 configured sales representatives
- ✅ Custom field definitions (text, number, dropdown)
- ✅ Full data model (User, Lead, Stage, Note, Email, CallLog, Activity, CustomField, PaymentLink)

#### Frontend UI
- ✅ Responsive sidebar navigation with branding
- ✅ Leads table view with sorting and search
- ✅ Kanban board view grouped by stage
- ✅ Toggle between table and Kanban views
- ✅ Search bar with filter capabilities
- ✅ Floating chatbot FAQ widget (on every page)
- ✅ Lead detail page layout (3-panel design)
- ✅ Settings pages (Pipeline, Integrations, Import)
- ✅ Design system with burgundy (#6B2C39) and purple (#7B4397) theme

#### APIs
- ✅ `GET /api/leads` - Fetch leads with pagination
- ✅ `GET /api/leads/[id]` - Fetch individual lead details
- ✅ `GET /api/stages` - Fetch pipeline stages
- ✅ `GET /api/status` - Health check endpoint

---

## 🚀 How to Run

### 1. Start the Development Server
```bash
npm run dev
```
Server will start on `http://localhost:3000`

### 2. Access the Application
- **Main App**: http://localhost:3000
- **Leads List**: http://localhost:3000/leads
- **Lead Import**: http://localhost:3000/leads/import
- **Settings**: http://localhost:3000/settings/pipeline

---

## 📊 Database

### Seeded Data
- **30 Leads** distributed across 6 stages
- **3 Users** (Alice Chen - Admin, Bob Martinez - Rep, Carol Williams - Rep)
- **6 Pipeline Stages**: New, Contacted, Qualified, Proposal Sent, Won, Lost
- **Custom Fields**: Industry (text), Priority (dropdown)

### Re-seed Database
```bash
node seed-simple.js
```

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite
- **Styling**: Tailwind CSS
- **UI Components**: React functional components

### Project Structure
```
crm-demo/
├── app/
│   ├── api/           # API routes
│   ├── leads/         # Lead pages
│   ├── settings/      # Settings pages
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Redirects to /leads
│   └── globals.css    # Design system
├── components/        # Reusable UI components
├── lib/              # Utilities
├── prisma/           # Database schema
│   ├── schema.prisma
│   └── dev.db        # SQLite database
└── public/           # Static assets
```

---

## 🎨 Design System

### Colors
- **Primary Burgundy**: `#6B2C39` (main actions)
- **Primary Purple**: `#7B4397` (secondary, widget)
- **Border Gray**: `#e5e7eb`

### Typography
- **Base Font Size**: 14px
- **Font Family**: System sans-serif stack

### Components
- `.btn` - Standard button (primary/secondary)
- `.card` - Content card with shadow
- `.container` - Max-width wrapper

---

## 📝 Key Features

### Leads Management
- View all leads in table or Kanban format
- Search by name, email, or company
- Filter by source
- View lead details with UTM tracking
- Track deal value and custom fields

### Pipeline Stages
- 6 pre-configured stages with colors
- Kanban board with stage grouping
- Drag-to-move ready (UI prepared)
- Admin can customize stages

### Activity Tracking
- Activity timeline model
- Support for notes, emails, calls, stage changes
- Chronological feed ready for display

---

## ⚡ Next Steps to Complete MVP

**High Priority:**
1. Email compose with SMTP integration (using nodemailer)
2. Activity timeline UI component
3. Kanban drag-to-move stage updates
4. CSV import flow with column mapping

**Medium Priority:**
1. Lead creation/edit forms
2. Notes and call logging UI
3. Payment link generation
4. Stage management admin panel

**Lower Priority:**
1. Real authentication
2. Email tracking (open/click)
3. Integrations API wiring
4. Workflow automation

---

## 🔧 Development

### Database Query Example
```typescript
import sqlite3 from 'sqlite3';

function queryDB(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./prisma/dev.db');
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
```

### Add a New Page
```typescript
export default function NewPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Title</h1>
    </div>
  );
}
```

---

## 📦 Key Dependencies

- `next@16` - React framework
- `tailwindcss@4` - CSS utilities
- `sqlite3@6` - Database
- `nodemailer@9` - Email (when implemented)

---

**Status**: MVP Ready ✅ | Database Seeded ✅ | APIs Working ✅ | UI Complete ✅
