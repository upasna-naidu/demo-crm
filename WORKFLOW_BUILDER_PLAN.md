# Workflow Automation Builder - Strategic Plan

## Executive Summary
A visual, drag-and-drop workflow automation engine that allows business admins to:
- Create multi-branch automation workflows
- Route leads among sales executives
- Trigger actions based on conditions
- Monitor and test workflows
- No-code configuration

---

## 1. CORE USE CASES

### Lead Routing & Assignment
- When lead is created → Check lead score → Assign to highest-performing exec in that territory
- When lead quality improves → Move to more senior sales exec

### Lead Nurturing Sequences
- Lead created → Send welcome email → Wait 2 days → Send product info → Check if opened → If yes, assign to sales; if no, send reminder

### Deal Management
- Deal moved to "Proposal" stage → Create task for sales exec → If no activity for 5 days → Send reminder email → If still no activity → Escalate to manager

### Lead Scoring & Qualification
- Contact visited pricing page → +10 points
- Opened email 3x → +5 points
- Downloaded whitepaper → +15 points
- If score > 50 → Mark as "qualified" → Assign to sales exec

### Notification & Alerts
- High-value lead created → Notify team → Create Slack alert → Create internal task

---

## 2. ARCHITECTURE OVERVIEW

### Database Schema (New Tables)

```sql
-- Core Workflow Definition
CREATE TABLE "Workflow" (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  createdBy TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES "Company"(id)
);

-- Workflow Nodes (Each step in the workflow)
CREATE TABLE "WorkflowNode" (
  id TEXT PRIMARY KEY,
  workflowId TEXT NOT NULL,
  type TEXT NOT NULL, -- 'trigger', 'action', 'condition', 'delay', 'branch'
  label TEXT,
  position JSON, -- {x: 100, y: 50}
  config JSON, -- Node-specific configuration
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflowId) REFERENCES "Workflow"(id)
);

-- Connections Between Nodes (Edges/Branches)
CREATE TABLE "WorkflowEdge" (
  id TEXT PRIMARY KEY,
  workflowId TEXT NOT NULL,
  fromNodeId TEXT NOT NULL,
  toNodeId TEXT NOT NULL,
  label TEXT, -- "Yes", "No", "Default", etc.
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflowId) REFERENCES "Workflow"(id),
  FOREIGN KEY (fromNodeId) REFERENCES "WorkflowNode"(id),
  FOREIGN KEY (toNodeId) REFERENCES "WorkflowNode"(id)
);

-- Workflow Executions (Audit Trail)
CREATE TABLE "WorkflowExecution" (
  id TEXT PRIMARY KEY,
  workflowId TEXT NOT NULL,
  triggeredBy TEXT NOT NULL, -- 'lead_id', 'deal_id', 'manual_test'
  triggeredValue TEXT, -- Actual lead/deal ID
  status TEXT, -- 'running', 'completed', 'failed', 'paused'
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME,
  result JSON, -- Final output
  FOREIGN KEY (workflowId) REFERENCES "Workflow"(id)
);

-- Step-by-Step Execution Log
CREATE TABLE "WorkflowExecutionLog" (
  id TEXT PRIMARY KEY,
  executionId TEXT NOT NULL,
  nodeId TEXT NOT NULL,
  status TEXT, -- 'pending', 'running', 'completed', 'failed', 'skipped'
  input JSON,
  output JSON,
  executedAt DATETIME,
  FOREIGN KEY (executionId) REFERENCES "WorkflowExecution"(id),
  FOREIGN KEY (nodeId) REFERENCES "WorkflowNode"(id)
);
```

---

## 3. NODE TYPES & CAPABILITIES

### TRIGGER NODES (Starting Points)
- **Lead Created** → Fires when new lead enters system
- **Lead Updated** → Fires when lead properties change
- **Deal Created/Moved** → Fires on deal lifecycle events
- **Contact Updated** → Fires on contact property changes
- **Ticket Created** → Fires on new support ticket
- **Manual Trigger** → Admin manually triggers for testing
- **Scheduled Trigger** → Time-based (daily, weekly, specific date)

### ACTION NODES (Do Something)
- **Assign to User** → Assign lead/deal to specific sales exec (with round-robin logic)
- **Send Email** → Send templated email to lead/contact
- **Send SMS** → Send text message
- **Create Task** → Create task for assigned user
- **Update Field** → Modify lead/deal/contact properties
- **Change Status** → Move lead to different stage
- **Send Notification** → Notify team members in-app
- **Webhook Call** → Call external API
- **Create Deal** → Create new deal from lead
- **Slack/Teams Message** → Post to team communication platform

### CONDITION NODES (Decision Points)
- **Lead Score Check** → If score > X, then branch A; else branch B
- **Lead Source Check** → Route based on where lead came from
- **Field Comparison** → If field = value, branch A; else branch B
- **Score Range** → Check if score is between X and Y
- **Custom Logic** → Custom condition builder

### UTILITY NODES
- **Delay** → Wait X days/hours before continuing
- **Wait for Event** → Wait until specific event occurs (email opened, page visited)
- **Branch/Parallel** → Split workflow into multiple paths
- **Merge** → Combine multiple branches back together

---

## 4. USER INTERFACE COMPONENTS

### Main Workflow Builder Screen

```
┌─────────────────────────────────────────────────────────────┐
│  Workflows > Create New                              [Save] │
│                                                               │
│  ┌─────────────┐                                             │
│  │ Triggers    │                    ┌─────────────────────┐  │
│  ├─ Lead       │                    │  Canvas Area        │  │
│  ├─ Deal       │                    │                     │  │
│  ├─ Contact    │    [Drag nodes]    │   ┌──────────────┐  │  │
│  ├─ Ticket     │      here ↘        │   │ Lead Created │  │  │
│  ├─ Schedule   │                    │   └──────┬───────┘  │  │
│  │             │                    │          │           │  │
│  ├─ Actions    │                    │   ┌──────▼───────┐  │  │
│  ├─ Assign     │                    │   │  Condition:  │  │  │
│  ├─ Email      │                    │   │ Score > 50?  │  │  │
│  ├─ SMS        │                    │   └──┬───────┬──┘  │  │
│  ├─ Task       │                    │     YES     NO      │  │
│  ├─ Update     │                    │  ┌──▼──┐  ┌──▼──┐  │  │
│  ├─ Notify     │                    │  │Assign│ │Email│  │  │
│  │             │                    │  └──────┘ └─────┘  │  │
│  ├─ Conditions │                    │                    │  │
│  ├─ Score      │                    │  [Test] [Activate] │  │
│  ├─ Source     │                    │                    │  │
│  ├─ Field      │                    └─────────────────────┘  │
│  │             │                                             │
│  ├─ Utilities  │                                             │
│  ├─ Delay      │                                             │
│  ├─ Wait       │                                             │
│  ├─ Branch     │                                             │
│  └─────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
```

### Node Configuration Panel (Right Sidebar)

```
┌────────────────────────────────┐
│ Node Configuration             │
├────────────────────────────────┤
│ Type: Assign to User           │
│ Label: Assign to Sales Exec    │
│                                │
│ ┌──────────────────────────────┤
│ │ Configuration:               │
│ │                              │
│ │ Assignment Method:           │
│ │ [v] Round Robin              │
│ │ [ ] Highest Score            │
│ │ [ ] Specific User            │
│ │ [ ] By Territory             │
│ │                              │
│ │ Filter by:                   │
│ │ [_____________] Search       │
│ │ [x] Active users only        │
│ │ [x] Same department          │
│ │                              │
│ │ [Update Config]              │
│ └──────────────────────────────┘
│                                │
│ ┌──────────────────────────────┤
│ │ Outputs (Next Nodes):        │
│ │ └→ Success: [Node ▼]         │
│ │ └→ Error: [Node ▼]           │
│ └──────────────────────────────┘
└────────────────────────────────┘
```

---

## 5. EXECUTION FLOW EXAMPLE

**Scenario: Lead Routing Workflow**

```
1. TRIGGER: Lead Created (from web form)
   ↓
2. ACTION: Update field → Set "status" = "new_lead"
   ↓
3. CONDITION: Is lead score > 50?
   ├→ YES: 
   │   ├→ ACTION: Assign to Sales Exec (round-robin)
   │   └→ ACTION: Send welcome email
   │       ├→ WAIT: Email opened?
   │       │   ├→ YES: Create task "Follow up call"
   │       │   └→ NO: After 2 days → Send reminder email
   │   └→ End
   │
   └→ NO:
       ├→ ACTION: Add to nurture sequence
       └→ DELAY: 5 days
           └→ ACTION: Send nurture email
               └→ CONDITION: Lead score now > 50?
                   ├→ YES: Assign to sales exec
                   └→ NO: Continue nurturing
```

---

## 6. IMPLEMENTATION PHASES

### PHASE 1: Foundation (Week 1-2)
- **Database setup** - Create Workflow, WorkflowNode, WorkflowEdge tables
- **API endpoints**:
  - `POST /api/workflows` - Create workflow
  - `GET /api/workflows` - List workflows for company
  - `PUT /api/workflows/[id]` - Save workflow structure
  - `POST /api/workflows/[id]/nodes` - Add/update nodes
  - `POST /api/workflows/[id]/edges` - Connect nodes
- **Basic UI** - Canvas component, drag-drop library (React Flow or similar)

### PHASE 2: Core Engine (Week 2-3)
- **Trigger engine** - Listen for lead created, deal moved events
- **Execution engine** - Execute workflow nodes sequentially
- **Action handlers** - Implement: Assign, Email, SMS, Task, Update
- **Condition engine** - Evaluate conditions and route flow
- **Logging** - Track every execution for audit trail

### PHASE 3: Advanced Features (Week 3-4)
- **Delay/Wait nodes** - Time-based logic
- **Parallel branching** - Multiple paths simultaneously
- **Testing/Preview** - Test workflows before activation
- **Monitoring dashboard** - View execution history, success rates
- **Error handling & retries** - Automatic retry logic

### PHASE 4: Admin UX (Week 4)
- **Workflow templates** - Pre-built common workflows
- **Execution logs viewer** - See what happened in each workflow run
- **Performance analytics** - How many leads routed, conversion rates
- **Bulk workflow operations** - Activate/deactivate multiple workflows

---

## 7. TECHNICAL DECISIONS

### Drag-Drop Library
- **React Flow** (Recommended) - Good node editor UX
- **Reactflow** - Lightweight alternative
- **Dnd-kit** - More flexible but more setup

### Workflow Execution
- **Synchronous** - Execute immediately (simpler, but can block)
- **Asynchronous** (Recommended) - Queue-based (using Node job queue)
- **Serverless-safe** - Use database state to track progress

### Database Considerations
- Store workflow definition as JSON (easy versioning)
- Store execution logs (never delete - important for audit)
- Use indexes on (companyId, workflowId) for fast lookups

---

## 8. KEY CONSIDERATIONS

✅ **Multi-tenancy** - Each company's workflows isolated by companyId  
✅ **Audit trail** - Every execution logged for compliance  
✅ **Error recovery** - Failed nodes don't break entire workflow  
✅ **Performance** - Avoid nested loops; use batch processing  
✅ **Testing** - "Test" mode executes without affecting real data  
✅ **Permissions** - Only company admins can create/edit workflows  
✅ **Limits** - Max nodes per workflow, execution timeout limits

---

## 9. WHAT THIS ENABLES FOR YOUR CUSTOMERS

1. **Lead Routing** - Auto-assign based on skills, territory, workload
2. **Nurture Sequences** - Multi-touch email sequences without Marketo
3. **SLA Enforcement** - Auto-escalate if no activity for X days
4. **Lead Scoring** - Automated point system based on actions
5. **Cross-sell/Upsell** - Auto-create opportunities when conditions met
6. **Team Notifications** - Alert right people at right time
7. **Process Standardization** - Force consistent sales process
8. **Compliance** - Audit trail of all automations and actions

---

## 10. ESTIMATED EFFORT

| Phase | Complexity | Timeline | API Endpoints | Components |
|-------|-----------|----------|----------------|------------|
| Phase 1 | Low | 1 week | 5 | Canvas, Nodes, Sidebar |
| Phase 2 | Medium | 1 week | 8+ | Engine, Handlers, Logger |
| Phase 3 | Medium | 1.5 weeks | 6+ | Delays, Branches, Monitor |
| Phase 4 | Low | 0.5 weeks | 4+ | Templates, Analytics |
| **TOTAL** | - | **4 weeks** | **23+** | **15+** |

---

This workflow builder transforms your CRM from a data tool into an **automation platform** - the key differentiator against competitors.
