import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const companies = await query(`
      SELECT id, name, website, industry, description, "createdAt"
      FROM "Company"
      ORDER BY "createdAt" DESC
    `);

    return NextResponse.json({
      success: true,
      companies,
      count: companies.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, website, industry, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const companyId = `company-${Date.now()}`;

    await run(
      `INSERT INTO "Company" (id, name, website, industry, description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [companyId, name, website || null, industry || null, description || null]
    );

    // Create empty company profile (optional - don't fail if table doesn't exist)
    try {
      const profileId = `profile-${companyId}`;
      await run(
        `INSERT INTO "CompanyProfile" (id, "companyId", "createdAt", "updatedAt")
         VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [profileId, companyId]
      );
    } catch (profileError) {
      console.log('CompanyProfile insert optional:', profileError);
    }

    return NextResponse.json({
      success: true,
      message: 'Company created',
      companyId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
