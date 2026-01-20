# Azure Database Fix - Add Missing Columns

## Problem
You're getting this error when submitting forms:
```
POST https://legacywobe.azurewebsites.net/api/workflow/submit 500 (Internal Server Error)
Workflow submit failed {"error":"column \"is_approved\" of relation \"form_submissions\" does not exist"}
```

## Solution
Your Azure PostgreSQL database is missing three columns that the backend API requires:
- `is_approved` - for tracking approval workflow status
- `is_draft` - for tracking draft forms
- `data` - for storing complete form data as JSON

## How to Fix

### Option 1: Using Azure Portal Query Editor

1. Go to your Azure Portal (portal.azure.com)
2. Navigate to your PostgreSQL database
3. Open the **Query editor**
4. Copy and paste the contents of `azure-add-is-approved-column.sql`
5. Click **Run**
6. Verify the output shows all three columns were added successfully

### Option 2: Using psql Command Line

1. Connect to your Azure PostgreSQL database:
   ```bash
   psql "host=YOUR_SERVER_NAME.postgres.database.azure.com port=5432 dbname=YOUR_DATABASE_NAME user=YOUR_USERNAME password=YOUR_PASSWORD sslmode=require"
   ```

2. Run the migration script:
   ```bash
   \i azure-add-is-approved-column.sql
   ```

### Option 3: Using Azure CLI

1. Install Azure CLI if you haven't already
2. Run:
   ```bash
   az postgres flexible-server execute \
     --name YOUR_SERVER_NAME \
     --admin-user YOUR_USERNAME \
     --admin-password YOUR_PASSWORD \
     --database-name YOUR_DATABASE_NAME \
     --file-path azure-add-is-approved-column.sql
   ```

## After Running the Migration

1. Verify the columns were added by checking the output of the verification query
2. Try submitting a form again - the error should be resolved
3. All workflow endpoints (submit, reject, forward, approve) should now work correctly

## Files Updated

- `azure-db-schema.sql` - Updated with the missing columns for future deployments
- `azure-add-is-approved-column.sql` - Migration script to add the missing columns

## Need Help?

If you encounter any issues:
1. Check that you have the correct database connection details
2. Verify your user has ALTER TABLE permissions
3. Check the Azure PostgreSQL logs for any error details
