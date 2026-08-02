# Automation Builder - Complete Testing Checklist

## 🎯 Testing Workflow

### Step 1: Navigate to Builder
- [ ] Go to https://demo-crm-eight-drab.vercel.app/automations/builder
- [ ] Page loads without errors
- [ ] Left sidebar shows node palette
- [ ] Canvas area is visible (gray background)
- [ ] Right sidebar shows "Select a node to configure"
- [ ] Top toolbar shows "New Automation" with Save/Test buttons

### Step 2: Test Trigger Node Creation
- [ ] Click "Lead Created" button in left sidebar
  - Expected: A RED node labeled "Lead Created" appears on canvas
  - Config: Should show trigger options (created_after, source_filter, min_score, company_filter)

- [ ] Click "Lead Updated" button
  - Expected: A RED node labeled "Lead Updated" appears
  - Config: Should show field_changed, updated_after options

- [ ] Click "Deal Moved" button
  - Expected: A RED node labeled "Deal Moved" appears
  - Config: Should show from_stage, to_stage, min_value options

### Step 3: Test Action Node Creation
- [ ] Click "Assign Lead" button
  - Expected: A TEAL/TURQUOISE node labeled "Assign Lead" appears
  - Config: Should show method (round-robin, highest-score, specific-user), filter options

- [ ] Click "Send Email" button
  - Expected: A TEAL node labeled "Send Email" appears
  - Config: Should show template, recipient options

- [ ] Click "Send SMS" button
  - Expected: A TEAL node labeled "Send SMS" appears
  - Config: Should show message, phoneField options

- [ ] Click "Create Task" button
  - Expected: A TEAL node labeled "Create Task" appears
  - Config: Should show title, priority, days options

### Step 4: Test Condition Node Creation
- [ ] Click "Score Check" button in CONDITIONS section
  - Expected: A YELLOW/ROUND node labeled "Score Check" appears
  - Config: Should show operator (>, <, =, >=, <=, between), value, description

- [ ] Click "Source Match" button
  - Expected: A YELLOW node labeled "Source Match" appears
  - Config: Should show source dropdown, description

- [ ] Click "Field Equals" button
  - Expected: A YELLOW node labeled "Field Equals" appears
  - Config: Should show field, operator, value, description

### Step 5: Test Utility Node Creation
- [ ] Click "Delay" button in UTILITIES section
  - Expected: A light-teal node labeled "Delay" appears
  - Config: Should show delay duration, unit options

### Step 6: Test Node Selection & Configuration
- [ ] Click any node on canvas
  - Expected: Node is selected (shows in right panel)
  - Right panel shows: Node type label, node name input field, configuration options
  
- [ ] Change node label (top input in right panel)
  - Expected: Node label updates on canvas in real-time

- [ ] Change configuration options
  - Expected: Config updates in node.data.config

- [ ] Click "Delete Node" button
  - Expected: Node is removed from canvas

### Step 7: Test Node Connections
- [ ] Drag from one node's handle (circle) to another node
  - Expected: A line connects the two nodes
  - For condition nodes: Should have 3 handles (yes, no, else)
  - For other nodes: Should have 2 handles (input, output)

- [ ] Hover over connection line
  - Expected: Can delete the connection (right-click context menu)

### Step 8: Test Automation Name & Description
- [ ] Click automation name field in toolbar
  - Expected: Can edit automation name

- [ ] Save automation
  - Expected: Automation is created/saved with all nodes and connections

### Step 9: Test Templates
- [ ] Go to /automations/templates
- [ ] Browse 7 templates (Lead Routing, Nurture Sequence, Deal SLA, etc.)
- [ ] Click "Use Template" or "Preview"
- [ ] Should load template nodes into builder

---

## ✅ Success Criteria

All nodes should:
- ✅ Create with CORRECT labels (not all "Lead Created")
- ✅ Have DISTINCT colors (red trigger, teal action, yellow condition)
- ✅ Show appropriate configuration options when selected
- ✅ Support connections (edges) between nodes
- ✅ Support deletion
- ✅ Support configuration updates

All functions should work:
- ✅ Node creation
- ✅ Node selection
- ✅ Node configuration
- ✅ Node deletion
- ✅ Connection creation
- ✅ Connection deletion
- ✅ Automation save
- ✅ Automation load

---

## 🐛 Troubleshooting

### Issue: All nodes show "Lead Created"
- **Solution**: Clear browser cache (Ctrl+Shift+Delete) and refresh
- **Alternative**: Open in private/incognito window
- **Last resort**: Wait 5 minutes for Vercel to fully deploy

### Issue: Right panel doesn't show config options
- **Solution**: Click node again to refresh
- **Check**: Ensure node type is correct (trigger/action/condition/delay)

### Issue: Can't connect nodes
- **Solution**: Look for handles (circles) on node edges
- **Note**: Drag from handle to handle, not node body to node body

### Issue: Save fails
- **Solution**: Check browser console (F12 → Console tab) for errors
- **Check**: Ensure automation has a name (top toolbar field)

---

## 📱 Quick Test Flow

1. Create "Lead Created" trigger
2. Create "Score Check" condition connected to it
3. Create "Assign Lead" action connected to condition (yes branch)
4. Create "Send Email" action connected to condition (no branch)
5. Name automation "Test Routing"
6. Click Save
7. Should redirect to /automations with success message

Expected result: New automation saved with 4 nodes and 3 connections.

---

## 📊 What Should Work After This

- ✅ Complete drag-drop automation builder
- ✅ 16+ node types with proper labels
- ✅ Trigger definitions with filters
- ✅ Action configurations
- ✅ Condition logic with descriptions
- ✅ Node connections/branching
- ✅ Automation save/load
- ✅ 7 pre-built templates to use
- ✅ Full execution engine (Phase 1 complete)

---

Generated: 2026-08-02
Status: Testing automation builder nodes and configurations
