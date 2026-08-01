import { NextRequest, NextResponse } from 'next/server';
import { query, run } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const profile = await query(
      `SELECT * FROM "CompanyProfile" WHERE "companyId" = $1`,
      [id]
    );

    if (!profile.length) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: profile[0],
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
    const { brandName, targetAudience, tone, industry, icp, values } = await request.json();

    const updates = [];
    const vals = [];
    let i = 1;

    if (brandName !== undefined) { updates.push(`"brandName" = $${i++}`); vals.push(brandName); }
    if (targetAudience !== undefined) { updates.push(`"targetAudience" = $${i++}`); vals.push(targetAudience); }
    if (tone !== undefined) { updates.push(`tone = $${i++}`); vals.push(tone); }
    if (industry !== undefined) { updates.push(`industry = $${i++}`); vals.push(industry); }
    if (icp !== undefined) { updates.push(`icp = $${i++}`); vals.push(icp); }
    if (values !== undefined) { updates.push(`values = $${i++}`); vals.push(values); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates' }, { status: 400 });
    }

    updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    vals.push(id);

    await run(
      `UPDATE "CompanyProfile" SET ${updates.join(', ')} WHERE "companyId" = $${i}`,
      vals
    );

    return NextResponse.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
