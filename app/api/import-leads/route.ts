import { NextRequest, NextResponse } from 'next/server';
import { run } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { leads } = await request.json();

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'leads array is required and must not be empty' },
        { status: 400 }
      );
    }

    let imported = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const lead of leads) {
      try {
        if (!lead.name || !lead.email) {
          failed++;
          errors.push(`Row: ${imported + 1} - name and email are required`);
          continue;
        }

        const leadId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await run(
          `INSERT INTO "Lead" (id, name, email, phone, company, title, source, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            leadId,
            lead.name,
            lead.email,
            lead.phone || null,
            lead.company || null,
            lead.title || null,
            lead.source || 'import'
          ]
        );
        imported++;
      } catch (error) {
        failed++;
        errors.push(`Row: ${imported + 1} - ${String(error)}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      failed,
      total: leads.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Imported ${imported} leads successfully`
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import leads', details: String(error) },
      { status: 500 }
    );
  }
}
