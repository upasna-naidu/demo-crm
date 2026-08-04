import { query, run, queryOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// GET webhook for company
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

    const webhook = await queryOne(
      `SELECT id, "companyId", url, secret, "isActive", "createdAt", "updatedAt"
       FROM "Webhook"
       WHERE "companyId" = $1
       LIMIT 1`,
      [companyId]
    );

    if (!webhook) {
      return Response.json({
        webhook: null,
        message: 'No webhook configured yet',
      });
    }

    return Response.json({
      webhook: {
        id: webhook.id,
        companyId: webhook.companyId,
        url: webhook.url,
        secret: '***' + webhook.secret.slice(-8), // Mask secret
        isActive: webhook.isActive,
        createdAt: webhook.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return Response.json({ error: 'Failed to fetch webhook' }, { status: 500 });
  }
}

// POST create/regenerate webhook
export async function POST(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const { action } = await request.json();

    // Check if webhook exists
    const existing = await queryOne(
      `SELECT id FROM "Webhook" WHERE "companyId" = $1`,
      [companyId]
    );

    if (existing && action !== 'regenerate') {
      return Response.json(
        { error: 'Webhook already exists. Use action: regenerate to create a new secret.' },
        { status: 400 }
      );
    }

    const webhookId = existing?.id || `webhook_${uuidv4()}`;
    const secret = crypto.randomBytes(32).toString('hex');
    const webhookUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/webhooks/lead-capture`;

    if (existing) {
      // Regenerate secret
      await run(
        `UPDATE "Webhook" SET secret = $1, "updatedAt" = $2 WHERE id = $3`,
        [secret, new Date().toISOString(), webhookId]
      );
    } else {
      // Create new webhook
      await run(
        `INSERT INTO "Webhook" (id, "companyId", url, secret, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          webhookId,
          companyId,
          webhookUrl,
          secret,
          1,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
    }

    return Response.json({
      success: true,
      webhook: {
        id: webhookId,
        url: webhookUrl,
        secret, // Return full secret on creation/regeneration
        companyId,
      },
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return Response.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}

// Ensure Webhook table exists
async function ensureWebhookTable() {
  try {
    await run(
      `CREATE TABLE IF NOT EXISTS "Webhook" (
        id TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        secret TEXT NOT NULL,
        "isActive" INTEGER DEFAULT 1,
        "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    );
  } catch (error) {
    console.error('Error creating Webhook table:', error);
  }
}

ensureWebhookTable();
