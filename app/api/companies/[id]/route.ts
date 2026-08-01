import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const company = await query(
      `SELECT * FROM "Company" WHERE id = $1`,
      [id]
    );

    if (!company.length) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const profile = await query(
      `SELECT * FROM "CompanyProfile" WHERE "companyId" = $1`,
      [id]
    );

    const users = await query(
      `SELECT cu.id, cu."userId", cu.role, cu."joinedAt", u.name, u.email
       FROM "CompanyUser" cu
       LEFT JOIN "User" u ON cu."userId" = u.id
       WHERE cu."companyId" = $1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      company: company[0],
      profile: profile[0] || null,
      users,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, website, industry, description } = await request.json();

    const updates = [];
    const vals = [];
    let i = 1;

    if (name !== undefined) { updates.push(`name = $${i++}`); vals.push(name); }
    if (website !== undefined) { updates.push(`website = $${i++}`); vals.push(website); }
    if (industry !== undefined) { updates.push(`industry = $${i++}`); vals.push(industry); }
    if (description !== undefined) { updates.push(`description = $${i++}`); vals.push(description); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates' }, { status: 400 });
    }

    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    vals.push(id);

    await run(
      `UPDATE "Company" SET ${updates.join(', ')} WHERE id = $${i}`,
      vals
    );

    return NextResponse.json({ success: true, message: 'Company updated' });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`\n[DELETE] ========== START DELETE ==========`);
    console.log(`[DELETE] Raw params:`, params);
    console.log(`[DELETE] ID type: ${typeof id}, value: "${id}", length: ${id?.length}`);

    // First verify the company exists
    const beforeDelete = await query(`SELECT id, name FROM "Company" WHERE id = $1`, [id]);
    console.log('[DELETE] Company exists before delete?:', beforeDelete.length > 0, beforeDelete);

    if (beforeDelete.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Company does not exist'
      }, { status: 404 });
    }

    try {
      const companyUserResult = await run(`DELETE FROM "CompanyUser" WHERE "companyId" = $1`, [id]);
      console.log('[DELETE] CompanyUser delete result:', companyUserResult);
    } catch (e) {
      console.log('[DELETE] CompanyUser delete optional:', e);
    }

    try {
      const profileResult = await run(`DELETE FROM "CompanyProfile" WHERE "companyId" = $1`, [id]);
      console.log('[DELETE] CompanyProfile delete result:', profileResult);
    } catch (e) {
      console.log('[DELETE] CompanyProfile delete optional:', e);
    }

    console.log('[DELETE] Running main DELETE on Company table...');
    const result = await run(`DELETE FROM "Company" WHERE id = $1`, [id]);
    console.log('[DELETE] Delete result:', result);
    console.log('[DELETE] Rows affected:', result?.changes);

    // Verify deletion by checking if company still exists
    const checkResult = await query(`SELECT id FROM "Company" WHERE id = $1`, [id]);
    console.log('[DELETE] Company still exists after delete?:', checkResult.length > 0);

    if (checkResult.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Company still exists after delete attempt',
        rowsAffected: result?.changes || 0,
        verificationCheck: checkResult.length
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Company deleted',
      deletedId: id,
      rowsAffected: result?.changes || 0
    });
  } catch (error) {
    console.error('[DELETE] Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
