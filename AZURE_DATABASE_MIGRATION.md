# 🗄️ **AZURE DATABASE MIGRATION GUIDE**
## Complete Database Migration from Supabase to Azure PostgreSQL

---

## 📋 **TABLE OF CONTENTS**

1. [Database Overview](#database-overview)
2. [Migration Options](#migration-options)
3. [Option 1: Keep Supabase (Recommended)](#option-1-keep-supabase-recommended)
4. [Option 2: Migrate to Azure PostgreSQL](#option-2-migrate-to-azure-postgresql)
5. [Step-by-Step Migration Process](#step-by-step-migration-process)
6. [Application Configuration Changes](#application-configuration-changes)
7. [Testing & Verification](#testing--verification)
8. [Rollback Plan](#rollback-plan)
9. [Cost Comparison](#cost-comparison)

---

## **DATABASE OVERVIEW**

### **Current Setup**
- **Database:** Supabase (PostgreSQL 15)
- **Location:** Supabase Cloud (managed service)
- **Access Method:** REST API via @supabase/supabase-js
- **Authentication:** Supabase Auth with Row Level Security
- **Connection:** HTTPS API (no direct database connection)

### **Database Structure**
- **Tables:** 1 main table (`form_submissions`)
- **Columns:** 131 columns
- **Data Types:** text, numeric, date, time, timestamptz, boolean, jsonb, uuid
- **Special Features:**
  - UUID primary keys
  - JSONB columns for complex data structures
  - Automatic timestamp updates
  - Row Level Security (RLS) policies
  - Triggers and functions

### **Current Data Volume**
```
Estimated rows: ~4 records (as of last check)
Estimated size: 128 KB
Growth rate: ~10-50 records per month (estimated)
```

---

## **MIGRATION OPTIONS**

### **Option 1: Keep Supabase (Recommended) ✅**
**Best for:** Most scenarios, especially if not required by compliance

**Pros:**
- ✅ Zero migration effort
- ✅ No downtime
- ✅ No data transfer complexity
- ✅ Built-in authentication & authorization
- ✅ Real-time capabilities available
- ✅ Automatic backups
- ✅ Free tier (500MB DB + unlimited API)
- ✅ Already tested and working

**Cons:**
- ❌ Data stored outside Azure tenant
- ❌ May not meet certain compliance requirements

### **Option 2: Migrate to Azure PostgreSQL**
**Best for:** When client requires all data in their Azure tenant

**Pros:**
- ✅ All infrastructure in client's Azure tenant
- ✅ Better compliance for certain industries
- ✅ Potential cost savings at scale
- ✅ Direct SQL access if needed

**Cons:**
- ❌ Requires complete application rewrite for database access
- ❌ Need to implement custom authentication
- ❌ Need to manage backups manually
- ❌ Higher setup complexity
- ❌ Potential downtime during migration

---

## **OPTION 1: KEEP SUPABASE (RECOMMENDED)**

### **Architecture**

```
┌──────────────────────────┐
│   Azure Static Web App   │
│      or App Service      │  ← Your React frontend
│   (Frontend Only)        │
└────────────┬─────────────┘
             │
             │ HTTPS API Calls
             │ (REST)
             │
             ▼
┌──────────────────────────┐
│    Supabase Cloud        │
│  ┌────────────────────┐  │
│  │  PostgreSQL DB     │  │  ← Your database
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  Auth System       │  │  ← Row Level Security
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  REST API          │  │  ← Auto-generated APIs
│  └────────────────────┘  │
└──────────────────────────┘
```

### **Setup Steps**

1. **No changes needed** - Your current setup already works this way
2. Deploy frontend to Azure (Static Web App or App Service)
3. Keep environment variables pointing to Supabase:
   ```
   VITE_SUPABASE_URL=https://nmgloirdngrtwhjafdaa.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### **Monthly Costs**

```
Supabase Free Tier:
  - 500 MB database storage: $0
  - Unlimited API requests: $0
  - 2 GB file storage: $0
  - 50 MB transfer: $0

Azure Static Web App:
  - Free tier: $0
  - Standard tier: $9/month

Total: $0 - $9/month
```

---

## **OPTION 2: MIGRATE TO AZURE POSTGRESQL**

⚠️ **WARNING:** This requires significant application changes!

---

## **STEP-BY-STEP MIGRATION PROCESS**

### **PHASE 1: CREATE AZURE POSTGRESQL DATABASE**

#### **1.1 Create Azure PostgreSQL Flexible Server**

**Via Azure Portal:**

1. Navigate to Azure Portal: https://portal.azure.com
2. Click "Create a resource" → Search for "Azure Database for PostgreSQL Flexible Server"
3. Click "Create"

**Configure Server:**
```yaml
Basics:
  Subscription: [Your Azure Subscription]
  Resource Group: legacy-work-order-rg (create new)
  Server name: legacy-work-order-db
  Region: [Same as your web app]
  PostgreSQL version: 15
  Workload type: Development (or Production based on needs)

Compute + Storage:
  Compute tier: Burstable
  Compute size: B1ms (1 vCore, 2 GiB RAM) - $12.41/month
  Storage size: 32 GiB - $4.16/month

Authentication:
  Admin username: postgres_admin
  Password: [Create strong password - SAVE THIS!]

Networking:
  Connectivity: Public access (allow Azure services)
  Firewall rules: Add current client IP
  SSL: Required
```

**Click "Review + Create"** → **Create**

#### **1.2 Create Database**

After server is created:

1. Go to the PostgreSQL server resource
2. Click "Databases" in left menu
3. Click "+ Add"
4. Database name: `workorder_db`
5. Click "Save"

#### **1.3 Get Connection Details**

Navigate to "Overview" and note:
```
Server name: legacy-work-order-db.postgres.database.azure.com
Server admin login name: postgres_admin
```

**Connection String:**
```
postgresql://postgres_admin:[YOUR_PASSWORD]@legacy-work-order-db.postgres.database.azure.com:5432/workorder_db?sslmode=require
```

---

### **PHASE 2: MIGRATE DATABASE SCHEMA**

#### **2.1 Connect to Azure PostgreSQL**

**Option A: Azure Cloud Shell**
```bash
psql "host=legacy-work-order-db.postgres.database.azure.com port=5432 dbname=workorder_db user=postgres_admin password=[YOUR_PASSWORD] sslmode=require"
```

**Option B: pgAdmin or DBeaver**
- Download and install pgAdmin: https://www.pgadmin.org/download/
- Create new server connection with Azure PostgreSQL details

**Option C: Azure Data Studio**
- Install PostgreSQL extension
- Connect using connection string

#### **2.2 Execute Schema Script**

1. Open the file `azure-db-schema.sql` (included in project)
2. Connect to your Azure PostgreSQL database
3. Execute the entire script

**Via psql:**
```bash
psql "host=legacy-work-order-db.postgres.database.azure.com port=5432 dbname=workorder_db user=postgres_admin password=[YOUR_PASSWORD] sslmode=require" -f azure-db-schema.sql
```

**Via Azure CLI:**
```bash
az postgres flexible-server execute \
  --name legacy-work-order-db \
  --admin-user postgres_admin \
  --admin-password "[YOUR_PASSWORD]" \
  --database-name workorder_db \
  --file-path azure-db-schema.sql
```

#### **2.3 Verify Schema Creation**

```sql
-- Check table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'form_submissions';

-- Check column count
SELECT COUNT(*) FROM information_schema.columns
WHERE table_name = 'form_submissions';
-- Should return: 131

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'form_submissions';

-- Check triggers
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'form_submissions';
```

---

### **PHASE 3: EXPORT DATA FROM SUPABASE**

#### **3.1 Export Using Supabase SQL Editor**

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to SQL Editor
4. Run this query:

```sql
SELECT * FROM form_submissions;
```

5. Export results as CSV or JSON

#### **3.2 Export Using pg_dump (More Reliable)**

```bash
# Get Supabase connection details from dashboard
# Navigate to Settings > Database > Connection String

pg_dump \
  "postgresql://postgres:[password]@db.nmgloirdngrtwhjafdaa.supabase.co:5432/postgres" \
  --table=form_submissions \
  --data-only \
  --column-inserts \
  > supabase_data_export.sql
```

#### **3.3 Alternative: Use Supabase Studio**

1. Go to Table Editor
2. Select `form_submissions` table
3. Click "..." → "Export data"
4. Choose format: CSV or SQL

---

### **PHASE 4: IMPORT DATA INTO AZURE POSTGRESQL**

#### **4.1 Import SQL Export**

```bash
psql "host=legacy-work-order-db.postgres.database.azure.com port=5432 dbname=workorder_db user=postgres_admin password=[YOUR_PASSWORD] sslmode=require" -f supabase_data_export.sql
```

#### **4.2 Import CSV (if exported as CSV)**

```sql
-- Connect to Azure PostgreSQL first
\copy form_submissions FROM 'supabase_data_export.csv' WITH CSV HEADER;
```

#### **4.3 Verify Data Import**

```sql
-- Check row count
SELECT COUNT(*) FROM form_submissions;

-- Check sample data
SELECT id, job_po_number, customer, created_at
FROM form_submissions
ORDER BY created_at DESC
LIMIT 5;
```

---

### **PHASE 5: UPDATE APPLICATION CODE**

⚠️ **CRITICAL:** This requires rewriting database access code!

#### **5.1 Install PostgreSQL Client**

```bash
npm install pg
npm install --save-dev @types/node
```

#### **5.2 Replace Supabase Client**

**Old code (Supabase):**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**New code (Azure PostgreSQL - REQUIRES BACKEND):**

⚠️ **You CANNOT connect directly from frontend to PostgreSQL!**

You must create a backend API layer:

```typescript
// backend/src/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;
```

```typescript
// backend/src/api/forms.ts
import express from 'express';
import pool from '../db';

const router = express.Router();

// Get all forms
router.get('/forms', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM form_submissions ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Create form
router.post('/forms', async (req, res) => {
  try {
    const { job_po_number, customer, ...data } = req.body;
    const result = await pool.query(
      'INSERT INTO form_submissions (job_po_number, customer, ...) VALUES ($1, $2, ...) RETURNING *',
      [job_po_number, customer, ...]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
```

#### **5.3 Update ALL Database Calls**

You need to replace every `supabase.from('form_submissions')` call with API calls to your new backend.

**This affects:**
- `src/pages/FormPage.tsx` (save/load forms)
- `src/pages/AdminDashboard.tsx` (list forms, delete forms)
- All form operations

**Example changes needed:**

**OLD (Supabase):**
```typescript
const { data, error } = await supabase
  .from('form_submissions')
  .select('*')
  .order('created_at', { ascending: false });
```

**NEW (Azure PostgreSQL via API):**
```typescript
const response = await fetch('/api/forms', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

---

### **PHASE 6: UPDATE ENVIRONMENT VARIABLES**

#### **6.1 Remove Supabase Variables**

Remove from Azure App Service Configuration:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

#### **6.2 Add PostgreSQL Variables**

Add to Azure App Service Configuration (backend only):
```
DATABASE_URL=postgresql://postgres_admin:[PASSWORD]@legacy-work-order-db.postgres.database.azure.com:5432/workorder_db?sslmode=require
```

---

### **PHASE 7: DEPLOY BACKEND API**

Since you now need a backend, you must:

1. **Create Node.js/Express backend**
2. **Deploy backend to Azure App Service**
3. **Configure CORS** to allow frontend to call backend
4. **Implement authentication** (JWT, OAuth, etc.)
5. **Implement authorization** (who can access what)

This is a **MAJOR** architectural change!

---

### **PHASE 8: TESTING & VERIFICATION**

#### **8.1 Test Database Connection**

```sql
-- From Azure Cloud Shell or psql
SELECT COUNT(*) FROM form_submissions;
```

#### **8.2 Test Backend API**

```bash
curl https://your-api.azurewebsites.net/api/forms
```

#### **8.3 Test Frontend**

1. Open application in browser
2. Test creating new form
3. Test viewing existing forms
4. Test editing forms
5. Test deleting forms
6. Check browser console for errors

---

### **PHASE 9: CONFIGURE BACKUPS**

#### **9.1 Enable Automated Backups**

Azure PostgreSQL Flexible Server includes:
- **Automatic backups:** Retained for 7 days (default)
- **Point-in-time restore:** Restore to any point within retention period

**To configure:**
1. Go to Azure PostgreSQL server
2. Click "Backup and restore"
3. Configure retention period (7-35 days)
4. Enable geo-redundant backup (optional, extra cost)

#### **9.2 Manual Backups**

```bash
# Full database backup
pg_dump "host=legacy-work-order-db.postgres.database.azure.com port=5432 dbname=workorder_db user=postgres_admin password=[PASSWORD] sslmode=require" > backup_$(date +%Y%m%d).sql

# Restore from backup
psql "host=legacy-work-order-db.postgres.database.azure.com port=5432 dbname=workorder_db user=postgres_admin password=[PASSWORD] sslmode=require" < backup_20250112.sql
```

---

## **APPLICATION CONFIGURATION CHANGES**

### **Required Code Changes Summary**

1. ✅ Remove `@supabase/supabase-js` dependency
2. ✅ Install `pg` (PostgreSQL client)
3. ✅ Create backend API server (Express, NestJS, etc.)
4. ✅ Rewrite all database queries as API endpoints
5. ✅ Update frontend to call API instead of Supabase
6. ✅ Implement authentication system
7. ✅ Implement authorization/permissions
8. ✅ Deploy backend to Azure App Service
9. ✅ Configure CORS and security
10. ✅ Update environment variables

**Estimated Development Time:** 40-80 hours

---

## **TESTING & VERIFICATION**

### **Checklist**

- [ ] Azure PostgreSQL server created
- [ ] Database `workorder_db` created
- [ ] Schema script executed successfully
- [ ] All 131 columns present in `form_submissions` table
- [ ] Indexes created
- [ ] Triggers working
- [ ] Data exported from Supabase
- [ ] Data imported into Azure PostgreSQL
- [ ] Row counts match between Supabase and Azure
- [ ] Sample data verified
- [ ] Backend API created
- [ ] Backend deployed to Azure
- [ ] Frontend updated to use API
- [ ] Frontend deployed to Azure
- [ ] Environment variables configured
- [ ] Create form works
- [ ] List forms works
- [ ] Edit form works
- [ ] Delete form works
- [ ] Authentication works
- [ ] Authorization works
- [ ] Backups configured
- [ ] Monitoring configured
- [ ] No console errors

---

## **ROLLBACK PLAN**

If migration fails:

1. **Keep Supabase running** during migration (don't delete)
2. **Revert environment variables** to Supabase
3. **Redeploy old frontend** (without API changes)
4. **Database data is safe** in both locations
5. **Try again** after fixing issues

---

## **COST COMPARISON**

### **Supabase (Current)**
```
Free Tier:
  - Database: 500 MB - $0
  - API requests: Unlimited - $0
  - File storage: 2 GB - $0
  - Bandwidth: 5 GB - $0

Pro Tier (if needed):
  - $25/month
  - 8 GB database
  - 100 GB bandwidth

Total: $0 - $25/month
```

### **Azure PostgreSQL Migration**
```
Database:
  - Flexible Server (B1ms): $12.41/month
  - Storage (32 GB): $4.16/month
  - Backup storage: $2.40/month

Backend API:
  - App Service (B1): $13.14/month

Frontend:
  - Static Web App: $0 - $9/month

Total: $32 - $41/month (minimum)
Production tier: $100+ /month
```

**Savings with Supabase:** $32 - $400/month

---

## **RECOMMENDATION**

### **✅ KEEP SUPABASE (Option 1)**

**Unless your client has specific compliance requirements that mandate all data be in their Azure tenant, keeping Supabase is the best choice.**

**Reasons:**
1. ✅ Zero migration effort
2. ✅ No application rewrite needed
3. ✅ Lower monthly costs ($0 vs $32+)
4. ✅ Better developer experience
5. ✅ Built-in authentication
6. ✅ Automatic backups
7. ✅ Real-time capabilities
8. ✅ Already tested and working

**When to migrate:**
- ❌ Client requires data in their Azure tenant
- ❌ Compliance/regulatory requirements
- ❌ Need direct SQL access frequently
- ❌ Want all infrastructure in one place

---

## **NEXT STEPS**

### **If Keeping Supabase:**
1. Deploy frontend to Azure (already covered in main deployment guide)
2. Done! ✅

### **If Migrating to Azure PostgreSQL:**
1. Review this entire document
2. Estimate 40-80 hours for implementation
3. Create backend API architecture
4. Plan authentication system
5. Budget for higher Azure costs
6. Schedule migration window
7. Execute migration phases 1-9
8. Test thoroughly
9. Monitor production

---

## **SUPPORT & RESOURCES**

### **Azure PostgreSQL Documentation**
- https://docs.microsoft.com/azure/postgresql/

### **Migration Tools**
- Azure Database Migration Service
- pgAdmin
- DBeaver
- Azure Data Studio

### **Connection Troubleshooting**
```bash
# Test connection
psql "host=legacy-work-order-db.postgres.database.azure.com port=5432 dbname=workorder_db user=postgres_admin password=[PASSWORD] sslmode=require"

# Check firewall rules
az postgres flexible-server firewall-rule list --resource-group legacy-work-order-rg --name legacy-work-order-db

# Add your IP
az postgres flexible-server firewall-rule create \
  --resource-group legacy-work-order-rg \
  --name legacy-work-order-db \
  --rule-name AllowMyIP \
  --start-ip-address YOUR.IP.ADDRESS \
  --end-ip-address YOUR.IP.ADDRESS
```

---

## **CONCLUSION**

**You have two paths:**

1. **✅ RECOMMENDED:** Keep Supabase, deploy frontend to Azure
   - Time: 1-2 hours
   - Cost: $0-9/month
   - Complexity: Low

2. **⚠️ COMPLEX:** Migrate database to Azure PostgreSQL
   - Time: 40-80 hours
   - Cost: $32-400+/month
   - Complexity: High
   - Requires: Backend API, authentication system, complete rewrite

**Make your decision based on:**
- Client requirements
- Compliance needs
- Budget
- Development time available
- Technical complexity acceptable

---

**Files Included in This Project:**
- ✅ `AZURE_DATABASE_MIGRATION.md` (this file)
- ✅ `azure-db-schema.sql` (complete schema for Azure PostgreSQL)
- ✅ `export-supabase-data.sql` (data export script)
- ✅ Original deployment guide with full Azure instructions

**You now have everything needed for either path!**
