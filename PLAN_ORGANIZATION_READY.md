# CRM Organization-Ready Implementation Plan

## 🎯 Mission
Transform the CRM from a demo into a **production-ready platform** where organizations can:
1. Control access (Admin → Manager → Sales Person hierarchy)
2. Integrate their landing pages to auto-feed leads
3. **Design and execute CUSTOM workflows tailored to their unique business needs**

### 🔑 KEY PRINCIPLE: Maximum Admin Freedom
**Every organization's workflow is unique.** We don't enforce a single workflow pattern. Instead, we provide:
- ✅ **Full Automation Builder Freedom** - Admins can create ANY workflow they want
- ✅ **No Restrictions** - No "this org must do X" — admins decide their own process
- ✅ **Pre-built Templates as Shortcuts** (optional) — not requirements, just starting points
- ✅ **Flexible Triggers** - Support multiple event types (lead created, deal moved, manual, form submissions, etc.)
- ✅ **Flexible Actions** - All 15+ action types available (assign, email, SMS, WhatsApp, webhooks, Slack, tasks, etc.)
- ✅ **Flexible Branching** - Conditions allow complex logic (if score > 50 → assign to manager, else → assign to junior)
- ✅ **Flexible Timing** - Delays can be 5 min, 1 hour, 1 day, 7 days, or custom — admin decides

**Real-World Examples (All Supported):**

| Org Type | Their Unique Workflow | How We Support It |
|----------|----------------------|-------------------|
| **SaaS Sales** | Lead → Score Check → If hot: instant assign + welcome email. If cold: delay 5 days then nurture sequence | ✅ Conditions + delays + multiple actions |
| **Enterprise Sales** | Lead → Assign to sales manager → Manager approves → Then assign to sales rep → Then email + Slack alert + task | ✅ Sequential actions + Slack integration + task creation |
| **Marketplace** | Lead → Check source (partner vs self) → Different assignment logic per source → Different emails per source | ✅ Condition branching based on lead source + flexible assignments |
| **Services Agency** | Lead → Auto-create task + send intake form → Wait for form completion → Then send quote email + schedule call | ✅ Task creation + delay + conditional follow-up + Slack notification |
| **Insurance Broker** | Lead → Run compliance check → If pass: assign + welcome email. If fail: route to compliance team + create high-priority task | ✅ Condition branching to different teams + task priorities |
| **B2B Lead Gen** | Lead → Enrichment webhook → Score update → If qualified: assign + email + add to campaign. If not: add to nurture + delay 14 days | ✅ Webhook execution + scoring + conditional routing |

**All these unique workflows work WITHOUT code changes.** Admins just design their own automation using the builder.

---

## 📋 OVERVIEW: Three Core Systems

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORGANIZATION ADMIN                            │
│  • Setup company • Manage team access • Configure workflows      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            LANDING PAGE INTEGRATION (Real-time)                 │
│  Website Form → Webhook → CRM Lead Creation (automatic)         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         WORKFLOW EXECUTION (Automated Actions)                  │
│  Lead arrives → Delay 5min → Assign → Email → WhatsApp → Done  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 SYSTEM 1: MULTI-LEVEL ACCESS CONTROL

### Current State
- ❌ No role-based access control (RBAC)
- ❌ No user permissions system
- ❌ All authenticated users see all data
- ❌ No team management

### Target State
```
Super Admin (System)
    ↓
    └─ Organization Admin (Company-level control)
        ├─ Sales Manager (Team lead)
        │   └─ Sales Person (Individual contributor)
        └─ Marketing Manager
            └─ Marketing Person
```

### Database Schema Changes Needed

```sql
-- New Tables Required:

1. UserRole
   - id, name (admin, sales_manager, sales_person, marketing_manager, etc.)
   
2. Permission
   - id, name, description
   - Examples: "create_leads", "view_leads", "assign_leads", "manage_team", etc.
   
3. RolePermission
   - roleId, permissionId (maps roles to permissions)
   
4. User (Update existing)
   - Add: roleId, managerId (who supervises this user)
   
5. CompanyUser (NEW - Multi-tenant users)
   - userId, companyId, roleId (user's role within company)
   - isAdmin (true if org admin for this company)

6. UserTeam (NEW - Management hierarchy)
   - managerId, memberId (manager supervises member)
   - companyId
```

### Implementation Flow

#### 1.1 Super Admin Setup
- **Route:** `/admin`
- **Access:** Super admin only
- **Features:**
  - List all organizations
  - Create new organization + set admin user
  - Add admin user email → creates user with "super_admin" role

#### 1.2 Organization Admin Dashboard
- **Route:** `/company/dashboard`
- **Access:** Organization admins only
- **Features:**
  - View company info
  - **Team Management** tab:
    - Add Sales Manager (email → invite)
    - Add Sales Person (email → invite)
    - View org team hierarchy
    - Remove/modify access
  - **Webhook Integration** tab (see System 2)
  - **Workflow Configuration** tab (see System 3)

#### 1.3 Permission Enforcement
- **Middleware:** Check user role + permission on every request
- **Backend:**
  ```
  API Endpoints:
  - GET /api/leads → Filter by: (created by user OR assigned to user OR managed by user)
  - POST /api/leads/assign → Check permission: "assign_leads"
  - GET /api/team → Check permission: "manage_team"
  ```
- **Frontend:**
  - Hide buttons/features user can't access
  - Show "Access Denied" for unauthorized actions

### API Endpoints Needed

```
POST   /api/admin/companies              - Super admin create org
POST   /api/company/invite-user          - Org admin invite user
GET    /api/company/team                 - Get org team structure
PUT    /api/company/user/[id]/role       - Change user role
DELETE /api/company/user/[id]            - Remove user access
GET    /api/permissions                  - List available permissions
```

### Database Queries

```javascript
// Check if user can view leads in company
async function canViewLeads(userId, companyId) {
  const user = await db.queryOne(
    `SELECT r.* FROM "User" u
     JOIN "CompanyUser" cu ON u.id = cu.userId
     JOIN "Role" r ON cu.roleId = r.id
     WHERE u.id = $1 AND cu.companyId = $2`,
    [userId, companyId]
  );
  return user && user.hasPermission('view_leads');
}
```

---

## 🌐 SYSTEM 2: LANDING PAGE INTEGRATION (Real-time Lead Capture)

### Current State
- ❌ No public webhook endpoints
- ❌ No external form integration
- ❌ Leads only created manually in CRM
- ❌ No lead source tracking

### Target State
```
Organization's Website
       ↓ (form submission)
Public Webhook Endpoint: /webhooks/lead-capture
       ↓ (validate webhook signature)
Create Lead in CRM
       ↓
Trigger Automation Workflow
```

### Implementation Flow

#### 2.1 Create Public Webhook Endpoint
- **Route:** `/api/webhooks/lead-capture`
- **Auth:** Webhook signature validation (HMAC)
- **Payload:** 
  ```json
  {
    "companyId": "org_123",
    "webhookSecret": "secret_key_for_validation",
    "leadData": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Acme Corp",
      "source": "website_form",
      "landingPageUrl": "https://acme.com/demo",
      "customFields": {...}
    }
  }
  ```

#### 2.2 Generate Webhook Credentials
- **Super Admin** creates organization → generates webhook URL + secret
- **Organization Admin** can:
  - View webhook URL
  - Regenerate secret (invalidates old one)
  - View webhook logs (requests received)
  - Test webhook with sample data

#### 2.3 Webhook Processing Logic
```javascript
POST /api/webhooks/lead-capture
├─ Validate webhook signature (HMAC-SHA256)
├─ Validate required fields (name, email)
├─ Check if company exists and is active
├─ Check for duplicate lead (email + company)
├─ Create lead with:
│  ├─ companyId
│  ├─ source: "website_webhook"
│  ├─ landingPageUrl
│  ├─ status: "new"
│  ├─ stage: "incoming" (first stage)
│  └─ customFields
├─ Log webhook request (for admin visibility)
├─ Trigger automation workflow (if configured)
└─ Return: { success: true, leadId: "...", message: "Lead created" }
```

#### 2.4 Organization Admin UI for Webhooks
- **Route:** `/company/webhooks`
- **Features:**
  - Display webhook URL (copyable)
  - Display webhook secret (hidden, click to show)
  - Regenerate secret button
  - **Webhook Logs tab:**
    - List all webhook requests (timestamp, status, lead created?)
    - Show payload of each request
    - Show errors if any
  - **Test Webhook tab:**
    - Form to send sample lead data
    - See response in real-time
  - **Setup Instructions tab:**
    - Code snippet for different platforms (Typeform, Zapier, custom form)
    - Example JavaScript for form submit

### Implementation Details

#### Webhook Signature Validation (HMAC)
```javascript
// On organization admin side (configure once)
webhookSecret = "your_secret_key_here"

// On website (on form submit)
payload = JSON.stringify(leadData)
signature = HMAC_SHA256(payload, webhookSecret)
fetch('/api/webhooks/lead-capture', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Signature': signature
  },
  body: payload
})

// On CRM side (validate request)
function validateWebhookSignature(payload, signature, secret) {
  const expected = HMAC_SHA256(payload, secret)
  return signature === expected
}
```

#### Lead Deduplication
```javascript
// Check if lead already exists
const existingLead = await db.queryOne(
  `SELECT id FROM "Lead" 
   WHERE email = $1 AND "companyId" = $2`,
  [email, companyId]
)

if (existingLead) {
  return { success: false, error: "Lead already exists", leadId: existingLead.id }
}
```

### API Endpoints Needed

```
POST   /api/webhooks/lead-capture        - Public webhook (no auth)
POST   /api/company/webhooks             - Create/regenerate webhook
GET    /api/company/webhooks/logs        - View webhook requests
POST   /api/company/webhooks/test        - Test webhook
```

### Organization Setup Checklist
- [ ] Generate webhook URL
- [ ] Copy webhook URL to organization's website form
- [ ] Test lead capture (send test from website)
- [ ] Verify lead appears in CRM
- [ ] Configure automation workflow (System 3)

---

## ⚙️ SYSTEM 3: WORKFLOW AUTOMATION EXECUTION (The Core of Admin Freedom)

### Current State
- ✅ Automation Builder UI exists (drag-drop interface)
- ✅ 16+ node types available (triggers, actions, conditions, delays)
- ✅ Templates exist (7 pre-built workflows)
- ✅ Can create automations visually
- ❌ Automations don't actually execute (yet)
- ❌ No trigger listener system
- ❌ No job queue for scheduled/delayed actions
- ❌ No email/SMS integration

### Target State: Admin-Designed Workflows Executed Perfectly

The admin creates workflows in the builder. We make them execute reliably.

**Example Flow (Admin Decides This Workflow):**
```
Lead arrives (from webhook)
       ↓
Trigger: "Lead Created" event
       ↓
Execute Automation Workflow (exactly as admin designed):
  1. Condition: Score > 50? (admin-defined threshold)
       ├─ YES branch:
       │   ├─ Assign to Sales Manager (admin's choice)
       │   ├─ Send "Hot Lead" email (admin's template)
       │   ├─ Send WhatsApp alert (admin's message)
       │   └─ Add to "Hot Leads" campaign (admin's campaign)
       └─ NO branch:
           ├─ Wait 5 days (admin's nurture delay)
           ├─ Send nurture email (admin's template)
           ├─ Add to nurture sequence (admin's sequence)
           └─ Schedule follow-up task (admin's task timing)
       ↓
Complete (all admin-configured actions executed)
```

**What Makes This Possible:**
- Admin has complete freedom to design the workflow (not locked into templates)
- Every trigger, action, condition, and delay is configurable
- Admin can nest conditions and create complex branching
- Admin can chain multiple actions together
- System just executes what admin designed

### Implementation Flow

#### 3.1 The Automation Builder: Admin's Power Tool

**Critical**: The automation builder IS the product. It's how admins define workflows.

**What Admins Can Do (Full Freedom):**
1. **Choose Trigger** - What event starts the automation?
   - Lead Created (from webhook or manual)
   - Lead Updated (field changed)
   - Deal Moved (to new stage)
   - Manual Trigger (admin runs it)
   - Form Submitted (from landing page)
   
2. **Add Conditions** - What logic should run?
   - IF score > 50 THEN → branch A (assign to manager)
   - ELSE → branch B (assign to junior + nurture)
   - Multiple conditions can be chained
   
3. **Add Actions** - What should happen?
   - Assign Lead (round-robin, highest-score, specific person, or manager)
   - Send Email (template + variables)
   - Send SMS/WhatsApp (custom message)
   - Create Task (priority, deadline, assignee)
   - Update Field (set status, score, custom field)
   - Change Status (new → qualified → proposal)
   - Create Deal (convert lead to deal)
   - Call Webhook (trigger external system)
   - Post to Slack (notify team)
   - Add to Campaign (nurture sequence)
   - Schedule Call (calendar integration)
   - Record Activity (audit trail)
   - Create Note (internal documentation)
   
4. **Add Delays** - When should actions execute?
   - 5 minutes, 1 hour, 1 day, 7 days, or custom duration
   - Admin controls timing completely

5. **Save & Deploy** - Workflow is live
   - Future leads triggering this workflow will follow it automatically
   - Admin can edit/disable/delete anytime

**We Support Any Workflow Pattern The Admin Wants.** Our job is to execute it reliably.

### 3.2 Trigger System (Event Detection)
Need to detect when lead is created and trigger automations:

```javascript
// When lead created from webhook
async function createLeadFromWebhook(leadData) {
  // 1. Create lead in database
  const lead = await createLead(leadData)
  
  // 2. Find all automations for this company with "Lead Created" trigger
  const automations = await db.query(
    `SELECT a.* FROM "Automation" a
     WHERE a."companyId" = $1 
     AND a.enabled = true
     AND a."triggerType" = 'lead_created'`,
    [leadData.companyId]
  )
  
  // 3. Execute each automation workflow
  for (const automation of automations) {
    await executeAutomationWorkflow(automation.id, lead)
  }
  
  return lead
}
```

#### 3.2 Workflow Execution Engine
Execute nodes sequentially with support for delays:

```javascript
async function executeAutomationWorkflow(automationId, lead) {
  // 1. Create execution record
  const execution = await db.run(
    `INSERT INTO "AutomationExecution" 
     (id, "automationId", "triggeredValue", status, "startedAt")
     VALUES ($1, $2, $3, $4, $5)`,
    [
      uuidv4(),
      automationId,
      lead.id,
      'running',
      new Date().toISOString()
    ]
  )
  
  // 2. Get automation nodes & edges
  const nodes = await db.query(
    `SELECT * FROM "AutomationNode" WHERE "automationId" = $1`,
    [automationId]
  )
  const edges = await db.query(
    `SELECT * FROM "AutomationEdge" WHERE "automationId" = $1`,
    [automationId]
  )
  
  // 3. Execute starting from trigger node
  const triggerNode = nodes.find(n => n.type === 'trigger')
  await executeNode(triggerNode, nodes, edges, lead, execution.id)
}

async function executeNode(node, allNodes, edges, lead, executionId) {
  try {
    // Log node execution
    await logNodeExecution(executionId, node.id, 'started')
    
    let result = {}
    
    // Execute based on node type
    if (node.type === 'action') {
      result = await executeAction(node, lead)
    } else if (node.type === 'condition') {
      result = evaluateCondition(node, lead)
    } else if (node.type === 'delay') {
      result = await executeDelay(node)
    }
    
    // Log success
    await logNodeExecution(executionId, node.id, 'completed', result)
    
    // Find and execute next nodes
    const nextEdges = edges.filter(e => e.fromNodeId === node.id)
    for (const edge of nextEdges) {
      const nextNode = allNodes.find(n => n.id === edge.toNodeId)
      
      // Handle branching (conditions)
      if (node.type === 'condition' && result.branch !== edge.label) {
        continue // Skip this branch
      }
      
      // Execute next node
      await executeNode(nextNode, allNodes, edges, lead, executionId)
    }
  } catch (error) {
    await logNodeExecution(executionId, node.id, 'failed', { error: error.message })
  }
}
```

#### 3.3 Action Handlers (Real Implementations)

**Assign Action:**
```javascript
async function executeAssignAction(config, lead) {
  const method = config.method // 'round-robin', 'highest-score', 'specific-user'
  let userId
  
  if (method === 'round-robin') {
    // Get all sales people in company, find next in rotation
    const salesPeople = await db.query(
      `SELECT u.id FROM "User" u
       JOIN "CompanyUser" cu ON u.id = cu.userId
       JOIN "Role" r ON cu.roleId = r.id
       WHERE cu."companyId" = $1 AND r.name = 'sales_person'
       ORDER BY u.lastAssignmentTime ASC
       LIMIT 1`,
      [lead.companyId]
    )
    userId = salesPeople[0]?.id
  }
  
  // Assign lead to user
  await db.run(
    `UPDATE "Lead" SET "ownerId" = $1 WHERE id = $2`,
    [userId, lead.id]
  )
  
  return { success: true, assignedTo: userId }
}
```

**Email Action:**
```javascript
async function executeEmailAction(config, lead) {
  // Get email template
  const template = await db.queryOne(
    `SELECT * FROM "EmailTemplate" WHERE id = $1`,
    [config.templateId]
  )
  
  // Replace variables
  const subject = template.subject
    .replace('{{name}}', lead.name)
    .replace('{{company}}', lead.company)
  
  const body = template.body
    .replace('{{name}}', lead.name)
    .replace('{{company}}', lead.company)
  
  // Send via email service (SendGrid, Mailgun, etc.)
  await sendEmailViaService({
    to: lead.email,
    subject,
    body,
    from: 'noreply@crm.example.com'
  })
  
  return { success: true, emailSent: true, to: lead.email }
}
```

**Delay Action:**
```javascript
async function executeDelayAction(config) {
  const delayMs = config.delay * 60 * 1000 // Convert minutes to milliseconds
  
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ success: true, delayed: true })
    }, delayMs)
  })
}
```

**WhatsApp Action:**
```javascript
async function executeWhatsAppAction(config, lead) {
  // Send WhatsApp via Twilio
  await twilioClient.messages.create({
    from: 'whatsapp:+1234567890',
    to: `whatsapp:${lead.phone}`,
    body: config.message
      .replace('{{name}}', lead.name)
      .replace('{{company}}', lead.company)
  })
  
  return { success: true, whatsappSent: true, to: lead.phone }
}
```

#### 3.4 Database Tables for Workflow Execution
(Already exist, need to use them):
- `AutomationExecution` - Track each workflow run
- `AutomationExecutionLog` - Log each step

### External Integrations Needed

#### Email Service (SendGrid or Mailgun)
```
1. Create account on SendGrid/Mailgun
2. Get API key
3. Set environment variable: EMAIL_SERVICE_API_KEY
4. Install SDK: npm install @sendgrid/mail
```

#### SMS/WhatsApp (Twilio)
```
1. Create account on Twilio
2. Get API credentials (Account SID, Auth Token)
3. Get Twilio phone number
4. Set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE
5. Install SDK: npm install twilio
```

### API Endpoints Needed

```
POST   /api/automations/execute         - Manual execute automation
GET    /api/automations/[id]/executions - View execution history
GET    /api/automations/[id]/executions/[execId]/logs - View execution logs
```

---

## 📅 PHASED IMPLEMENTATION PLAN

### Phase 1: Access Control (Week 1)
**Effort:** 2-3 days
**Deliverable:** Role-based access control working

**Tasks:**
1. Create new database tables (UserRole, Permission, RolePermission, CompanyUser, UserTeam)
2. Add middleware to check permissions on all API endpoints
3. Create `/admin` super admin dashboard
4. Create `/company/dashboard` org admin dashboard
5. Create team management UI
6. Update authentication to use role system
7. Hide/show UI elements based on permissions

**Testing:**
- Create test users with different roles
- Verify super admin can see everything
- Verify org admin can only see their company
- Verify sales person can only see assigned leads

---

### Phase 2: Landing Page Integration (Week 1-2)
**Effort:** 2-3 days
**Deliverable:** Real-time lead capture from websites

**Tasks:**
1. Create public webhook endpoint `/api/webhooks/lead-capture`
2. Implement HMAC signature validation
3. Add webhook logging to database
4. Create organization webhook management UI
5. Display webhook URL, secret, logs in admin dashboard
6. Add webhook test functionality
7. Document webhook integration for organizations

**Testing:**
- Generate webhook for test organization
- Send sample lead via curl/Postman
- Verify lead appears in CRM with correct data
- Test webhook signature validation

---

### Phase 3: Automation Execution (Week 2-3)
**Effort:** 3-4 days
**Deliverable:** Fully functional workflow automation

**Tasks:**
1. Implement trigger listener (detect lead creation events)
2. Build workflow execution engine (traverse nodes sequentially)
3. Implement action handlers:
   - Assign lead
   - Send email (integrate SendGrid)
   - Send SMS (integrate Twilio)
   - Send WhatsApp (integrate Twilio)
   - Update field
   - Change status
4. Implement condition evaluation (branching logic)
5. Implement delay execution
6. Add execution logging and monitoring
7. Create admin UI to view automation executions

**Testing:**
- Create automation: Lead arrives → 5 min delay → Assign → Email
- Trigger via webhook
- Verify each step executes in order
- Verify delay works
- Verify email is sent
- Check execution logs

---

### Phase 4: Polish & Hardening (Week 3-4)
**Effort:** 2-3 days
**Deliverable:** Production-ready

**Tasks:**
1. Rate limiting on webhooks
2. Error handling and retries
3. Webhook signature rotation
4. Audit logs for admin actions
5. Organization onboarding flow
6. Documentation for setup
7. Demo/test automations

---

## 📊 Architecture Diagram

```
┌──────────────────────────────────────┐
│      Super Admin Dashboard           │
│  • Manage organizations              │
│  • Set organization admins           │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│   Organization Admin Dashboard       │
│  • Team management                   │
│  • Webhook integration               │
│  • Workflow configuration            │
└──────────────────────────────────────┘
           ↓
      3 Systems:
   
┌─────────────────┐ ┌──────────────────┐ ┌────────────────┐
│   Access        │ │  Landing Page    │ │   Workflow     │
│   Control       │ │   Integration    │ │   Automation   │
│                 │ │                  │ │                │
│ • Roles         │ │ • Webhooks       │ │ • Trigger      │
│ • Permissions   │ │ • Signature      │ │ • Execute      │
│ • Team Mgmt     │ │   validation     │ │ • Actions      │
│                 │ │ • Lead creation  │ │ • Conditions   │
└─────────────────┘ └──────────────────┘ └────────────────┘
                             ↓
                    Organization CRM
                  (Sales, Marketing, Ops)
```

---

## ✅ Success Criteria

When complete, the organization should be able to:

1. **Access Control:**
   - [ ] Organization admin logs in and manages team
   - [ ] Admins can invite sales managers & sales people
   - [ ] Each user sees only data they should access
   - [ ] Roles prevent unauthorized actions

2. **Lead Capture:**
   - [ ] Organization gets webhook URL in admin panel
   - [ ] Website form submits to webhook
   - [ ] Lead automatically appears in CRM within seconds
   - [ ] Lead source and landing page URL tracked

3. **Automation:**
   - [ ] Organization admin creates automation workflow
   - [ ] Workflow triggers when lead arrives
   - [ ] Delay works (5 min wait before assign)
   - [ ] Lead assigned to correct sales person
   - [ ] Email sent automatically
   - [ ] WhatsApp message sent automatically
   - [ ] Admin can see execution logs

---

## 🎯 Effort Estimate
- **Total Time:** 2-3 weeks (4-6 developer weeks)
- **Phase 1 (Access):** 2-3 days
- **Phase 2 (Webhooks):** 2-3 days
- **Phase 3 (Automation):** 3-4 days
- **Phase 4 (Polish):** 2-3 days

---

## 📝 Notes

- Once this is done, the CRM is **production-ready for first customers**
- Can start taking real organizations on this workflow
- Focus on reliability and security (especially webhooks)
- Automation execution should be robust (retry failed actions, handle edge cases)

---

**Next Steps:**
1. Review this plan with user
2. Get approval on phasing
3. Start Phase 1 (Access Control)
