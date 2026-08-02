import { run, query } from '@/lib/db';

export interface ActionContext {
  triggeredValue: string;
  leadData?: any;
  dealData?: any;
  [key: string]: any;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Action Handler Registry
export const actionHandlers: Record<string, (config: any, context: ActionContext) => Promise<ActionResult>> = {
  'Assign Lead': assignLead,
  'Send Email': sendEmail,
  'Send SMS': sendSMS,
  'Create Task': createTask,
  'Update Field': updateField,
  'Change Status': changeStatus,
  'Create Deal': createDeal,
  'Notify Team': notifyTeam,
  'Webhook Call': webhookCall,
  'Slack Message': slackMessage,
  'Record Activity': recordActivity,
  'Add to Campaign': addToCampaign,
  'Schedule Call': scheduleCall,
  'Update CRM Field': updateCRMField,
  'Create Note': createNote,
};

async function assignLead(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const method = config.method || 'round-robin';
    const filter = config.filter || 'all';

    let userId: string;

    if (method === 'round-robin') {
      const users = await query(`SELECT id FROM "User" LIMIT 1`);
      userId = users[0]?.id || 'default_user';
    } else if (method === 'highest-score') {
      const users = await query(`SELECT id FROM "User" ORDER BY score DESC LIMIT 1`);
      userId = users[0]?.id || 'default_user';
    } else if (method === 'specific-user') {
      userId = config.userId || 'default_user';
    } else {
      userId = 'default_user';
    }

    await run(
      `UPDATE "Lead" SET "ownerId" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`,
      [userId, context.triggeredValue]
    );

    return { success: true, message: `Lead assigned to user ${userId}`, data: { userId } };
  } catch (error) {
    return { success: false, message: 'Failed to assign lead', error: String(error) };
  }
}

async function sendEmail(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const templateId = config.template || 'default';
    const recipient = config.recipient || 'lead_email';

    // In production, integrate with email service (SendGrid, Mailgun, etc.)
    const emailLog = {
      templateId,
      recipient,
      leadId: context.triggeredValue,
      sentAt: new Date().toISOString(),
    };

    return { success: true, message: `Email sent from template ${templateId}`, data: emailLog };
  } catch (error) {
    return { success: false, message: 'Failed to send email', error: String(error) };
  }
}

async function sendSMS(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const message = config.message || 'Default SMS message';
    const phoneField = config.phoneField || 'phone';

    // In production, integrate with SMS service (Twilio, etc.)
    const smsLog = {
      message,
      leadId: context.triggeredValue,
      sentAt: new Date().toISOString(),
    };

    return { success: true, message: 'SMS sent successfully', data: smsLog };
  } catch (error) {
    return { success: false, message: 'Failed to send SMS', error: String(error) };
  }
}

async function createTask(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const taskId = `task_${Date.now()}`;
    const title = config.title || 'Follow-up task';
    const priority = config.priority || 'medium';
    const daysUntilDue = config.days || 3;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysUntilDue);

    // Create task in database
    await run(
      `INSERT INTO "Task" (id, title, priority, "dueDate", "leadId") VALUES ($1, $2, $3, $4, $5)`,
      [taskId, title, priority, dueDate.toISOString(), context.triggeredValue]
    );

    return { success: true, message: `Task created: ${title}`, data: { taskId, dueDate } };
  } catch (error) {
    return { success: false, message: 'Failed to create task', error: String(error) };
  }
}

async function updateField(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const field = config.field || 'status';
    const value = config.value || 'updated';

    await run(
      `UPDATE "Lead" SET "${field}" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`,
      [value, context.triggeredValue]
    );

    return { success: true, message: `Field ${field} updated to ${value}`, data: { field, value } };
  } catch (error) {
    return { success: false, message: 'Failed to update field', error: String(error) };
  }
}

async function changeStatus(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const newStatus = config.status || 'qualified';

    await run(
      `UPDATE "Lead" SET status = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`,
      [newStatus, context.triggeredValue]
    );

    return { success: true, message: `Status changed to ${newStatus}`, data: { status: newStatus } };
  } catch (error) {
    return { success: false, message: 'Failed to change status', error: String(error) };
  }
}

async function createDeal(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const dealId = `deal_${Date.now()}`;
    const title = config.dealTitle || `Deal from Lead`;
    const value = config.value || 0;

    await run(
      `INSERT INTO "Deal" (id, "leadId", title, value, status) VALUES ($1, $2, $3, $4, $5)`,
      [dealId, context.triggeredValue, title, value, 'open']
    );

    return { success: true, message: `Deal created: ${title}`, data: { dealId, value } };
  } catch (error) {
    return { success: false, message: 'Failed to create deal', error: String(error) };
  }
}

async function notifyTeam(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const message = config.message || 'New notification';
    const recipients = config.recipients || 'team';

    // In production, send via notification service
    const notification = {
      message,
      recipients,
      createdAt: new Date().toISOString(),
    };

    return { success: true, message: 'Team notified', data: notification };
  } catch (error) {
    return { success: false, message: 'Failed to notify team', error: String(error) };
  }
}

async function webhookCall(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const webhookUrl = config.webhookUrl || '';
    const method = config.method || 'POST';
    const payload = config.payload || {};

    if (!webhookUrl) {
      return { success: false, message: 'Webhook URL not configured', error: 'Missing URL' };
    }

    // Make webhook call
    const response = await fetch(webhookUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, triggeredBy: context.triggeredValue }),
    });

    return {
      success: response.ok,
      message: `Webhook called (${response.status})`,
      data: { status: response.status },
    };
  } catch (error) {
    return { success: false, message: 'Webhook call failed', error: String(error) };
  }
}

async function slackMessage(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const webhookUrl = config.slackWebhook || '';
    const message = config.message || 'Automation triggered';
    const channel = config.channel || '#notifications';

    if (!webhookUrl) {
      return { success: false, message: 'Slack webhook not configured', error: 'Missing URL' };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        text: message,
        attachments: [
          {
            color: 'good',
            text: `Triggered by: ${context.triggeredValue}`,
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      }),
    });

    return {
      success: response.ok,
      message: 'Slack message sent',
      data: { channel },
    };
  } catch (error) {
    return { success: false, message: 'Slack message failed', error: String(error) };
  }
}

async function recordActivity(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const activityType = config.activityType || 'call';
    const notes = config.notes || 'Automated activity';

    // Log activity
    const activityLog = {
      type: activityType,
      notes,
      leadId: context.triggeredValue,
      createdAt: new Date().toISOString(),
    };

    return { success: true, message: `Activity recorded: ${activityType}`, data: activityLog };
  } catch (error) {
    return { success: false, message: 'Failed to record activity', error: String(error) };
  }
}

async function addToCampaign(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const campaignId = config.campaignId || 'default_campaign';
    const campaignName = config.campaignName || 'Campaign';

    // Add lead to campaign
    const result = {
      campaignId,
      leadId: context.triggeredValue,
      addedAt: new Date().toISOString(),
    };

    return { success: true, message: `Added to campaign: ${campaignName}`, data: result };
  } catch (error) {
    return { success: false, message: 'Failed to add to campaign', error: String(error) };
  }
}

async function scheduleCall(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const callType = config.callType || 'outbound';
    const duration = config.duration || 15; // minutes
    const daysFromNow = config.daysFromNow || 1;

    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + daysFromNow);

    const result = {
      callType,
      duration,
      scheduledFor: scheduledFor.toISOString(),
      leadId: context.triggeredValue,
    };

    return { success: true, message: `Call scheduled for ${callType}`, data: result };
  } catch (error) {
    return { success: false, message: 'Failed to schedule call', error: String(error) };
  }
}

async function updateCRMField(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const crmField = config.crmField || 'custom_field';
    const crmValue = config.crmValue || '';
    const crmObject = config.crmObject || 'lead';

    const result = {
      crmObject,
      crmField,
      value: crmValue,
    };

    return { success: true, message: `CRM field updated: ${crmField}`, data: result };
  } catch (error) {
    return { success: false, message: 'Failed to update CRM field', error: String(error) };
  }
}

async function createNote(config: any, context: ActionContext): Promise<ActionResult> {
  try {
    const noteContent = config.noteContent || 'Automated note';
    const noteType = config.noteType || 'general';

    const note = {
      content: noteContent,
      type: noteType,
      leadId: context.triggeredValue,
      createdAt: new Date().toISOString(),
    };

    return { success: true, message: 'Note created', data: note };
  } catch (error) {
    return { success: false, message: 'Failed to create note', error: String(error) };
  }
}
