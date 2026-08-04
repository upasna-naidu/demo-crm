# 🧪 BRUTAL TEST SUITE - Complete System Validation

## Test Engineer Report: Comprehensive QA Testing
**Objective:** Validate all 3 phases end-to-end with aggressive testing
**Methodology:** Test every endpoint, UI page, workflow step, and edge case
**Status:** In Progress ⏳

---

## ✅ PHASE 1: ACCESS CONTROL TESTING

### 1.1 Role & Permission System
- [ ] GET /api/init - Initialize roles and permissions
- [ ] GET /api/roles - List all available roles
- [ ] Verify all 6 roles exist: super_admin, org_admin, sales_manager, sales_person, marketing_manager, marketing_person
- [ ] Verify all permissions are created (20+ permissions)

### 1.2 Organization Management
- [ ] POST /api/organizations - Create organization with admin
- [ ] GET /api/organizations - List organizations
- [ ] Verify admin user is created
- [ ] Verify admin has org_admin role

### 1.3 Team Management
- [ ] POST /api/organizations/[id]/team - Invite user
- [ ] GET /api/organizations/[id]/team - List team members
- [ ] PUT /api/organizations/[id]/team/[userId] - Change user role
- [ ] DELETE /api/organizations/[id]/team/[userId] - Remove user
- [ ] Verify role changes work correctly

### 1.4 UI - Organization Dashboard
- [ ] Visit /company/dashboard
- [ ] Page loads without 404 errors
- [ ] Display team member count
- [ ] Display webhook count
- [ ] Display automation count
- [ ] Invite form works
- [ ] Role dropdown shows all roles
- [ ] Edit member role works
- [ ] Remove member works

---

## ✅ PHASE 2: WEBHOOK TESTING

### 2.1 Webhook Creation
- [ ] POST /api/organizations/[id]/webhooks - Create webhook
- [ ] Webhook URL is generated
- [ ] Webhook secret is generated (64 chars hex)
- [ ] Webhook returned in response

### 2.2 Webhook Management
- [ ] GET /api/organizations/[id]/webhooks - Retrieve webhook
- [ ] Secret is masked in retrieval (security test)
- [ ] Can regenerate secret
- [ ] Old secret becomes invalid

### 2.3 Webhook UI
- [ ] Visit /company/webhooks
- [ ] Page loads without 404
- [ ] Display webhook URL (copyable)
- [ ] Display webhook secret (with show/hide toggle)
- [ ] Can copy URL to clipboard
- [ ] Can view/hide secret
- [ ] Can regenerate secret
- [ ] Test webhook form exists
- [ ] Setup instructions displayed

### 2.4 Lead Capture via Webhook
- [ ] Generate valid HMAC-SHA256 signature
- [ ] POST to /api/webhooks/lead-capture with valid signature
- [ ] Lead created successfully
- [ ] Lead appears in database
- [ ] Lead has correct data (name, email, company, etc.)
- [ ] Webhook with invalid signature rejected (401)
- [ ] Webhook without signature rejected (401)
- [ ] Duplicate email check works

### 2.5 Security Testing
- [ ] Invalid signature rejected
- [ ] Missing signature rejected
- [ ] Tampered payload rejected
- [ ] Wrong company ID rejected (404)

---

## ✅ PHASE 3: AUTOMATION TESTING

### 3.1 Automation Creation
- [ ] POST /api/automations - Create automation
- [ ] Automation record created in database
- [ ] Can set name and description
- [ ] Can enable/disable automation

### 3.2 Node Creation
- [ ] POST /api/automations/[id]/nodes - Add trigger node (Lead Created)
- [ ] POST /api/automations/[id]/nodes - Add action node (Assign Lead)
- [ ] POST /api/automations/[id]/nodes - Add action node (Send Email)
- [ ] POST /api/automations/[id]/nodes - Add condition node (Score Check)
- [ ] All nodes have correct labels
- [ ] All nodes have correct types
- [ ] Nodes stored with position and config

### 3.3 Edge Creation
- [ ] POST /api/automations/[id]/edges - Connect trigger to action
- [ ] POST /api/automations/[id]/edges - Connect action to action
- [ ] POST /api/automations/[id]/edges - Connect condition with branches (yes/no/else)
- [ ] Edges have correct source/target

### 3.4 Automation UI - Builder
- [ ] Visit /automations/builder
- [ ] Page loads without 404
- [ ] Left sidebar shows node palette
- [ ] Can click node buttons to add nodes
- [ ] Right sidebar shows config panel
- [ ] Canvas renders React Flow
- [ ] Nodes appear with correct colors
  - Red for triggers
  - Teal for actions
  - Yellow for conditions
- [ ] Can drag nodes
- [ ] Can connect nodes
- [ ] Can delete nodes
- [ ] Can save automation
- [ ] Save redirects to /automations page

### 3.5 Automation Execution - Trigger
- [ ] Send lead via webhook
- [ ] Automation with "Lead Created" trigger executes
- [ ] Execution record created
- [ ] Trigger node executes

### 3.6 Automation Execution - Actions
- [ ] Assign Lead action executes
- [ ] Lead is assigned to a user
- [ ] Send Email action executes
- [ ] Email sending attempted
- [ ] Create Task action executes
- [ ] Change Status action executes

### 3.7 Automation Execution - Conditions
- [ ] Score Check condition evaluates
- [ ] Source Match condition evaluates
- [ ] Field Equals condition evaluates
- [ ] Branching logic works (yes/no)

### 3.8 Automation Execution Logging
- [ ] GET /api/automations/[id]/logs - Get execution history
- [ ] Execution records show status
- [ ] Node logs show execution details
- [ ] Timestamps are correct
- [ ] Errors are logged properly

### 3.9 Automation UI - Automations List
- [ ] Visit /automations
- [ ] Page loads without 404
- [ ] Display automation count
- [ ] Display enabled count
- [ ] Display total executions
- [ ] List automations in table
- [ ] Can enable/disable automation
- [ ] Can delete automation
- [ ] Link to templates works
- [ ] Link to builder works

### 3.10 Templates
- [ ] Visit /automations/templates
- [ ] Page loads without 404
- [ ] Display 7 templates
- [ ] Filter by category works
- [ ] Filter by industry works
- [ ] Can preview template
- [ ] Can use template

---

## 🔴 KNOWN ISSUES TO FIX

1. **404 on /automation?_rsc=...**
   - Status: NEEDS INVESTIGATION
   - Impact: Critical
   - Page: Likely /automations or /automations/builder

2. **Email Template Not Found**
   - Status: Expected (no templates created yet)
   - Impact: Low (graceful failure)
   - Fix: Create default email templates

3. **Database Persistence**
   - Status: In-memory SQLite on Vercel
   - Impact: Data not persisting across Vercel deploys
   - Fix: Use PostgreSQL in production

---

## 📊 TEST RESULTS

### Coverage Checklist
- [ ] Access Control: 100%
- [ ] Webhooks: 100%
- [ ] Automations: 100%
- [ ] Security: 100%
- [ ] UI/UX: 100%
- [ ] Error Handling: 100%
- [ ] Database: 100%
- [ ] API: 100%

### Issues Found: 0 CRITICAL, 0 MAJOR, X MINOR

---

## ✅ FINAL APPROVAL CHECKLIST

- [ ] All API endpoints responding
- [ ] All UI pages loading
- [ ] All workflows executing
- [ ] All data persisting
- [ ] All security validations passing
- [ ] All error handling working
- [ ] No console errors
- [ ] No 404s on intended pages
- [ ] No TypeScript errors
- [ ] Ready for organization testing

---

Generated: 2026-08-05
Status: TESTING IN PROGRESS
