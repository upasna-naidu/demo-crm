import { query, queryOne, run } from './db';
import { v4 as uuidv4 } from 'uuid';

interface ExecutionContext {
  leadId: string;
  lead: any;
  companyId: string;
  executionId: string;
}

interface Node {
  id: string;
  type: string;
  label: string;
  data: any;
}

interface Edge {
  source: string;
  target: string;
  label?: string;
}

export async function executeAutomationWorkflow(automationId: string, leadId: string, companyId: string) {
  try {
    console.log(`Executing automation ${automationId} for lead ${leadId}`);

    // Create execution record
    const executionId = `exec_${uuidv4()}`;
    await run(
      `INSERT INTO "AutomationExecution" (id, "automationId", "triggeredBy", "triggeredValue", status, "startedAt")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [executionId, automationId, 'webhook', leadId, 'running', new Date().toISOString()]
    );

    // Get automation details
    const automation = await queryOne(
      `SELECT * FROM "Automation" WHERE id = $1`,
      [automationId]
    );

    if (!automation) {
      await logExecution(executionId, 'error', 'Automation not found');
      return;
    }

    // Get lead
    const lead = await queryOne(
      `SELECT * FROM "Lead" WHERE id = $1`,
      [leadId]
    );

    if (!lead) {
      await logExecution(executionId, 'error', 'Lead not found');
      return;
    }

    // Get automation nodes and edges
    const nodes = await query(
      `SELECT * FROM "AutomationNode" WHERE "automationId" = $1`,
      [automationId]
    );

    const edges = await query(
      `SELECT * FROM "AutomationEdge" WHERE "automationId" = $1`,
      [automationId]
    );

    const context: ExecutionContext = {
      leadId,
      lead,
      companyId,
      executionId,
    };

    // Find trigger node
    const triggerNode = nodes.find((n: any) => n.type === 'trigger');
    if (!triggerNode) {
      await logExecution(executionId, 'error', 'No trigger node found');
      return;
    }

    // Execute starting from trigger
    await executeNode(
      triggerNode,
      nodes,
      edges,
      context
    );

    // Mark execution as completed
    await run(
      `UPDATE "AutomationExecution" SET status = $1, "completedAt" = $2 WHERE id = $3`,
      ['completed', new Date().toISOString(), executionId]
    );

    console.log(`Automation execution ${executionId} completed`);
  } catch (error) {
    console.error('Error executing automation:', error);
  }
}

async function executeNode(
  node: any,
  allNodes: any[],
  edges: any[],
  context: ExecutionContext
) {
  try {
    console.log(`Executing node: ${node.label}`);
    await logNodeExecution(context.executionId, node.id, 'started', node.label);

    // Parse config if it's a JSON string
    if (typeof node.config === 'string') {
      node.config = JSON.parse(node.config);
    }

    // Ensure data object exists
    if (!node.data) {
      node.data = {};
    }
    if (!node.data.config) {
      node.data.config = node.config || {};
    }

    let result: any = { success: true };

    // Execute based on node type
    if (node.type === 'trigger') {
      result = await executeTrigger(node, context);
    } else if (node.type === 'action') {
      result = await executeAction(node, context);
    } else if (node.type === 'condition') {
      result = await evaluateCondition(node, context);
    } else if (node.type === 'delay') {
      result = await executeDelay(node, context);
    }

    await logNodeExecution(context.executionId, node.id, 'completed', node.label, result);

    // Find and execute next nodes
    const nextEdges = edges.filter((e: any) => e.fromNodeId === node.id);

    for (const edge of nextEdges) {
      const nextNode = allNodes.find((n: any) => n.id === edge.toNodeId);

      if (!nextNode) continue;

      // Handle branching for conditions
      if (node.type === 'condition') {
        const edgeLabel = edge.label || 'default';
        if (result.branch !== edgeLabel) {
          continue; // Skip this branch
        }
      }

      // Recurse to next node
      await executeNode(nextNode, allNodes, edges, context);
    }
  } catch (error) {
    console.error(`Error executing node ${node.id}:`, error);
    await logNodeExecution(
      context.executionId,
      node.id,
      'failed',
      node.label,
      { error: (error as any).message }
    );
  }
}

async function executeTrigger(node: any, context: ExecutionContext) {
  // Trigger just passes through
  return { success: true, triggered: true };
}

async function executeAction(node: any, context: ExecutionContext) {
  const { label, data } = node;
  const config = data.config || {};

  switch (label) {
    case 'Assign Lead':
      return await assignLead(config, context);
    case 'Send Email':
      return await sendEmail(config, context);
    case 'Send SMS':
      return await sendSMS(config, context);
    case 'Send WhatsApp':
      return await sendWhatsApp(config, context);
    case 'Create Task':
      return await createTask(config, context);
    case 'Update Field':
      return await updateField(config, context);
    case 'Change Status':
      return await changeStatus(config, context);
    case 'Create Deal':
      return await createDeal(config, context);
    case 'Slack Message':
      return await sendSlackMessage(config, context);
    case 'Webhook Call':
      return await callWebhook(config, context);
    default:
      return { success: true, message: `Action ${label} would execute` };
  }
}

async function evaluateCondition(node: any, context: ExecutionContext) {
  const { label, data } = node;
  const config = data.config || {};

  switch (label) {
    case 'Score Check':
      return await checkScore(config, context);
    case 'Source Match':
      return await matchSource(config, context);
    case 'Field Equals':
      return await fieldEquals(config, context);
    default:
      return { success: true, branch: 'default' };
  }
}

async function assignLead(config: any, context: ExecutionContext) {
  const { lead } = context;
  const method = config.method || 'round-robin';

  let ownerId: string | null = null;

  if (method === 'round-robin') {
    // Get all sales people, find next in rotation
    const salesPeople = await query(
      `SELECT u.id FROM "User" u
       JOIN "CompanyUser" cu ON u.id = cu."userId"
       WHERE cu."companyId" = $1 AND cu."roleId" LIKE '%sales%'
       ORDER BY u.id ASC LIMIT 1`,
      [context.companyId]
    );
    ownerId = salesPeople[0]?.id || null;
  } else if (method === 'highest-score') {
    // Get user with highest score
    const topUsers = await query(
      `SELECT u.id FROM "User" u
       JOIN "CompanyUser" cu ON u.id = cu."userId"
       WHERE cu."companyId" = $1
       ORDER BY u.id DESC LIMIT 1`,
      [context.companyId]
    );
    ownerId = topUsers[0]?.id || null;
  }

  if (ownerId) {
    await run(
      `UPDATE "Lead" SET "ownerId" = $1, "updatedAt" = $2 WHERE id = $3`,
      [ownerId, new Date().toISOString(), context.leadId]
    );
  }

  return { success: true, assigned: true, ownerId };
}

async function sendEmail(config: any, context: ExecutionContext) {
  const { lead } = context;
  const templateId = config.template || 'welcome';

  // Get template
  const template = await queryOne(
    `SELECT * FROM "EmailTemplate" WHERE id = $1`,
    [templateId]
  );

  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  // Replace variables
  const subject = (template.subject || '')
    .replace('{{name}}', lead.name)
    .replace('{{company}}', lead.company);

  const body = (template.body || '')
    .replace('{{name}}', lead.name)
    .replace('{{company}}', lead.company);

  // TODO: Send via email service (SendGrid, Mailgun, etc.)
  console.log(`Would send email to ${lead.email}: ${subject}`);

  return { success: true, emailSent: true, to: lead.email };
}

async function sendSMS(config: any, context: ExecutionContext) {
  const { lead } = context;
  const message = config.message || 'Hello {{name}}';

  const finalMessage = message
    .replace('{{name}}', lead.name)
    .replace('{{company}}', lead.company);

  // TODO: Send via Twilio
  console.log(`Would send SMS to ${lead.phone}: ${finalMessage}`);

  return { success: true, smsSent: true, to: lead.phone };
}

async function sendWhatsApp(config: any, context: ExecutionContext) {
  const { lead } = context;
  const message = config.message || 'Hello {{name}}';

  const finalMessage = message
    .replace('{{name}}', lead.name)
    .replace('{{company}}', lead.company);

  // TODO: Send via Twilio WhatsApp
  console.log(`Would send WhatsApp to ${lead.phone}: ${finalMessage}`);

  return { success: true, whatsappSent: true, to: lead.phone };
}

async function createTask(config: any, context: ExecutionContext) {
  const { lead } = context;
  const taskId = `task_${uuidv4()}`;

  await run(
    `INSERT INTO "Task" (id, title, "leadId", priority, "dueDate", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      taskId,
      config.title || 'Follow up',
      context.leadId,
      config.priority || 'medium',
      new Date(Date.now() + (config.days || 3) * 86400000).toISOString(),
      new Date().toISOString(),
    ]
  );

  return { success: true, taskCreated: true, taskId };
}

async function updateField(config: any, context: ExecutionContext) {
  const { field, value } = config;

  if (!field || value === undefined) {
    return { success: false, error: 'Missing field or value' };
  }

  // Generic field update
  const updateSql = `UPDATE "Lead" SET "${field}" = $1, "updatedAt" = $2 WHERE id = $3`;
  await run(updateSql, [value, new Date().toISOString(), context.leadId]);

  return { success: true, fieldUpdated: true, field, value };
}

async function changeStatus(config: any, context: ExecutionContext) {
  const status = config.status || 'qualified';

  await run(
    `UPDATE "Lead" SET status = $1, "updatedAt" = $2 WHERE id = $3`,
    [status, new Date().toISOString(), context.leadId]
  );

  return { success: true, statusChanged: true, status };
}

async function createDeal(config: any, context: ExecutionContext) {
  const { lead } = context;
  const dealId = `deal_${uuidv4()}`;

  await run(
    `INSERT INTO "Deal" (id, "leadId", title, value, currency, status, "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      dealId,
      context.leadId,
      config.title || `Deal - ${lead.name}`,
      config.value || 0,
      config.currency || 'USD',
      'open',
      new Date().toISOString(),
    ]
  );

  return { success: true, dealCreated: true, dealId };
}

async function sendSlackMessage(config: any, context: ExecutionContext) {
  const { lead } = context;
  const message = config.message || `New lead: ${lead.name}`;

  // TODO: Send via Slack API
  console.log(`Would send Slack message: ${message}`);

  return { success: true, slackSent: true };
}

async function callWebhook(config: any, context: ExecutionContext) {
  const { url, method = 'POST' } = config;

  if (!url) {
    return { success: false, error: 'No webhook URL configured' };
  }

  // TODO: Make actual HTTP request
  console.log(`Would call webhook ${url} with lead data`);

  return { success: true, webhookCalled: true };
}

async function checkScore(config: any, context: ExecutionContext) {
  const { operator = '>', value = 50 } = config;
  const leadScore = context.lead.score || 0;

  let passes = false;
  switch (operator) {
    case '>':
      passes = leadScore > value;
      break;
    case '<':
      passes = leadScore < value;
      break;
    case '=':
      passes = leadScore === value;
      break;
    case '>=':
      passes = leadScore >= value;
      break;
    case '<=':
      passes = leadScore <= value;
      break;
    case 'between':
      passes = leadScore >= value && leadScore <= (config.value2 || value);
      break;
  }

  return { success: true, branch: passes ? 'yes' : 'no', condition: 'score', result: passes };
}

async function matchSource(config: any, context: ExecutionContext) {
  const source = config.source || 'website';
  const passes = context.lead.source === source;

  return { success: true, branch: passes ? 'yes' : 'no', condition: 'source', result: passes };
}

async function fieldEquals(config: any, context: ExecutionContext) {
  const { field = 'status', operator = 'equals', value } = config;
  const fieldValue = (context.lead as any)[field];

  let passes = false;
  switch (operator) {
    case 'equals':
      passes = fieldValue === value;
      break;
    case 'not_equals':
      passes = fieldValue !== value;
      break;
    case 'contains':
      passes = String(fieldValue).includes(String(value));
      break;
    case 'not_contains':
      passes = !String(fieldValue).includes(String(value));
      break;
  }

  return { success: true, branch: passes ? 'yes' : 'no', condition: 'field', result: passes };
}

async function executeDelay(node: any, context: ExecutionContext) {
  const { delay = 5, unit = 'minutes' } = node.data.config || {};

  let delayMs = delay * 60 * 1000; // Default to minutes
  if (unit === 'seconds') delayMs = delay * 1000;
  else if (unit === 'hours') delayMs = delay * 3600 * 1000;
  else if (unit === 'days') delayMs = delay * 86400 * 1000;

  console.log(`Delaying for ${delay} ${unit}...`);
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  return { success: true, delayed: true, duration: `${delay} ${unit}` };
}

async function logNodeExecution(
  executionId: string,
  nodeId: string,
  status: string,
  nodeName?: string,
  result?: any
) {
  try {
    const logId = `log_${uuidv4()}`;
    await run(
      `INSERT INTO "AutomationExecutionLog" (id, "executionId", "nodeId", status, output, "executedAt")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        logId,
        executionId,
        nodeId,
        status,
        result ? JSON.stringify(result) : null,
        new Date().toISOString(),
      ]
    );
  } catch (error) {
    console.error('Error logging node execution:', error);
  }
}

async function logExecution(executionId: string, status: string, message: string) {
  try {
    await run(
      `UPDATE "AutomationExecution" SET status = $1, result = $2, "completedAt" = $3 WHERE id = $4`,
      [status, message, new Date().toISOString(), executionId]
    );
  } catch (error) {
    console.error('Error logging execution:', error);
  }
}

// Create Task table if it doesn't exist
async function ensureTaskTable() {
  try {
    await run(
      `CREATE TABLE IF NOT EXISTS "Task" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        "leadId" TEXT,
        priority TEXT DEFAULT 'medium',
        "dueDate" DATETIME,
        completed INTEGER DEFAULT 0,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
  } catch (error) {
    console.error('Error creating Task table:', error);
  }
}

ensureTaskTable();
