# Simple CRM Board

A lightweight, drag-and-drop CRM board built with **Next.js 14+** and **Appwrite**. Manage leads, track follow-ups, assign tasks to team members, and store customer documents.

---

## 🚀 Features

### Lead Management
- **Drag & Drop** - Move leads between columns (Lead → Follow Up → To Do → Payment Collection)
- **Quick Add** - Create leads instantly with the "+ Quick Lead" button
- **Emergency Toggle** - Mark urgent leads with a red highlight (click the dot)
- **Notes & Reminders** - Add notes and set timed reminders on any lead
- **Soft Delete** - Check the box to mark as complete (moves to History, not deleted)

### Column Management
- **Custom Columns** - Add, rename, or delete columns as needed
- **Persistent Order** - Columns and lead positions save automatically

### Customer Profiles
- **Contact Info** - Store name, phone, email
- **Document Uploads** - Attach Passport, Aadhaar, PAN (up to 10MB each)
- **Team Assignment** - Assign multiple team members to a customer

### Multi-User Support
- **User Authentication** - Email/password login via Appwrite
- **Shared Board** - All logged-in users see the same data
- **Lead Assignment** - Assign leads to specific team members
- **History** - View completed tasks with timestamps

---

## 📋 User Guide

### Getting Started

1. **Sign Up** - Create an account at `/signup`
2. **Log In** - Access the board at `/login`
3. **Default Columns** - The board starts with 4 columns: Lead, Follow Up, To Do, Payment Collection

### Managing Leads

| Action | How To |
|--------|--------|
| **Create Lead** | Fill "NAME / TASK TITLE" field at top → Click "+ Add to Lead" |
| **Quick Lead** | Click "+ Quick Lead" at bottom of any column |
| **Move Lead** | Drag and drop between columns |
| **Edit Lead** | Click "Edit" button on card |
| **Add Note** | Click "Note" button → Enter text |
| **Set Reminder** | Click "Reminder" → Enter text and optional time (YYYY-MM-DD HH:MM) |
| **Mark Urgent** | Click the small dot in top-right of card (turns red) |
| **Complete Lead** | Check the checkbox → Moves to History |
| **Delete Lead** | Click "Delete" button (permanent) |

### Customer Management

1. **From Top Bar** - Type customer name → Check "Save as customer" → Click "+ Add to Lead"
2. **Search Existing** - Type in search box → Select customer → Click "Add Lead" or "Profile"
3. **View All** - Menu (☰) → Customers List

### Customer Profile

- **Documents**: Upload Passport, Aadhaar, PAN files
- **Team Members**: Assign users who can work on this customer
- **View Documents**: Click "View Document" to download

### History (Completed Tasks)

- Menu (☰) → **Completed (History)**
- **Restore** - Bring a task back to the board
- **Delete** - Permanently remove

### Reminders

- Menu (☰) → **Reminders**
- Shows all leads with reminders, sorted by time

---

## 📁 File Limits

| Type | Limit |
|------|-------|
| **Max File Size** | 05 MB |
| **Allowed Formats** | JPEG, PNG, WebP, PDF |
| **Document Types** | Passport, Aadhaar, PAN |

---

## 🔄 Application Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sign Up   │ ──▶ │   Log In    │ ──▶ │  Dashboard  │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
            ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
            │  Create Lead  │         │  Move Leads   │         │    Menus      │
            │  (Top Bar)    │         │  (Drag/Drop)  │         │    (☰)        │
            └───────────────┘         └───────────────┘         └───────────────┘
                    │                          │                          │
                    ▼                          ▼               ┌──────────┼──────────┐
            ┌───────────────┐         ┌───────────────┐        │          │          │
            │ Lead Actions  │         │   Persists    │        ▼          ▼          ▼
            │ Edit/Note/    │         │  to Database  │   Reminders  History   Customers
            │ Remind/Assign │         └───────────────┘
            └───────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│ Mark Complete │       │    Delete     │
│ (Soft Delete) │       │  (Permanent)  │
└───────────────┘       └───────────────┘
        │
        ▼
┌───────────────┐
│   History     │
│  (Restorable) │
└───────────────┘
```

---

## 🛠 Setup

### Prerequisites
- Node.js 18+
- Appwrite Cloud account

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd crm-next

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Configure .env.local with your Appwrite credentials
```

### Environment Variables

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_DATABASE_ID=crm_db
NEXT_PUBLIC_COLUMNS_COLLECTION_ID=columns
NEXT_PUBLIC_LEADS_COLLECTION_ID=leads
NEXT_PUBLIC_CUSTOMERS_COLLECTION_ID=customers
NEXT_PUBLIC_DOCUMENTS_BUCKET_ID=customer-documents
APPWRITE_API_SECRET=your-api-key
```

### Database Setup

Run the setup scripts:

```bash
# Create database, collections, and storage bucket
node scripts/setup-appwrite.mjs

# Add document fields to customers (if updating existing setup)
node scripts/add-customer-document-fields.mjs

# Add is_completed field to leads (if updating existing setup)
node scripts/add-is-completed-attribute.mjs
```

### Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📊 Database Schema

### Collections

**columns**
| Field | Type | Required |
|-------|------|----------|
| title | String | Yes |
| order | Integer | Yes |

**leads**
| Field | Type | Required |
|-------|------|----------|
| title | String | Yes |
| details | String | No |
| status | String | No |
| assigned_to | String | No |
| is_emergency | Boolean | No |
| is_completed | Boolean | No |
| order | Integer | No |
| note | String | No |
| reminder | String | No |
| reminder_time | Integer | No |

**customers**
| Field | Type | Required |
|-------|------|----------|
| name | String | Yes |
| phone | String | No |
| email | String | No |
| details | String | No |
| passport_file_id | String | No |
| aadhaar_file_id | String | No |
| pan_file_id | String | No |
| assigned_users | String | No |

### Storage Bucket

**customer-documents**
- Max file size: 5 MB
- Allowed types: JPEG, PNG, WebP, PDF

---

## 🔐 Security Notes

- All data is stored in Appwrite Cloud
- Authentication via Appwrite's secure session management
- File uploads are validated for type and size
- For production, configure proper Appwrite permissions

---

## 📝 License

MIT License
