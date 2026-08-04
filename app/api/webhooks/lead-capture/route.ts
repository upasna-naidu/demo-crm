import { query, run, queryOne } from '@/lib/db';
import { validateWebhookSignature, generateWebhookSignature } from '@/lib/webhook';
import { executeAutomationWorkflow } from '@/lib/automationExecutor';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-webhook-signature');

    if (!signature) {
      return Response.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { companyId, webhookSecret, leadData } = payload;

    if (!companyId || !webhookSecret || !leadData) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate webhook signature
    try {
      validateWebhookSignature(bodyText, signature, webhookSecret);
    } catch (error) {
      return Response.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Verify company exists
    const company = await queryOne(
      `SELECT id FROM "Company" WHERE id = $1`,
      [companyId]
    );

    if (!company) {
      return Response.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check for duplicate lead
    if (leadData.email) {
      const existing = await queryOne(
        `SELECT id FROM "Lead" WHERE email = $1 AND company = $2`,
        [leadData.email, companyId]
      );

      if (existing) {
        return Response.json({
          success: false,
          message: 'Lead already exists',
          leadId: existing.id,
        });
      }
    }

    // Create lead
    const leadId = `lead_${uuidv4()}`;
    await run(
      `INSERT INTO "Lead" (
        id, name, email, phone, company, title, source, status, "stageId",
        "ownerId", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        leadId,
        leadData.name || 'Unknown',
        leadData.email || null,
        leadData.phone || null,
        leadData.company || companyId, // Store companyId as company field
        leadData.title || null,
        leadData.source || 'webhook',
        'new',
        'incoming', // Default stage
        null, // No owner yet
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );

    // Log webhook request
    await logWebhookRequest(
      companyId,
      'lead-capture',
      'success',
      bodyText,
      leadId
    );

    // Trigger automation workflows for this lead
    await triggerAutomations(leadId, companyId);

    return Response.json({
      success: true,
      message: 'Lead created successfully',
      leadId,
    });
  } catch (error) {
    console.error('Webhook error:', error);

    // Log failed request
    try {
      await logWebhookRequest(
        'unknown',
        'lead-capture',
        'error',
        (error as any)?.message || 'Unknown error',
        null
      );
    } catch (logError) {
      console.error('Error logging failed webhook:', logError);
    }

    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function logWebhookRequest(
  companyId: string,
  webhookType: string,
  status: string,
  payload: string,
  leadId: string | null
) {
  try {
    const logId = `wl_${uuidv4()}`;
    await run(
      `INSERT INTO "WebhookLog" (id, "companyId", type, status, payload, "leadId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        logId,
        companyId,
        webhookType,
        status,
        payload,
        leadId,
        new Date().toISOString(),
      ]
    );
  } catch (error) {
    console.error('Error logging webhook:', error);
  }
}

async function triggerAutomations(leadId: string, companyId: string) {
  try {
    // Find all automations with "Lead Created" trigger for this company
    const automations = await query(
      `SELECT a.* FROM "Automation" a
       WHERE a."companyId" = $1 AND a.enabled = 1
       AND EXISTS (
         SELECT 1 FROM "AutomationNode" an
         WHERE an."automationId" = a.id AND an.type = 'trigger'
       )`,
      [companyId]
    );

    // Execute each automation
    for (const automation of automations) {
      // Run in background (don't await to keep webhook response fast)
      executeAutomationWorkflow(automation.id, leadId, companyId).catch((err) => {
        console.error(`Error executing automation ${automation.id}:`, err);
      });
    }
  } catch (error) {
    console.error('Error triggering automations:', error);
  }
}

// Create WebhookLog table if it doesn't exist
async function ensureWebhookLogTable() {
  try {
    await run(
      `CREATE TABLE IF NOT EXISTS "WebhookLog" (
        id TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        payload TEXT,
        "leadId" TEXT,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
  } catch (error) {
    console.error('Error creating WebhookLog table:', error);
  }
}

// Call on app start
ensureWebhookLogTable();
