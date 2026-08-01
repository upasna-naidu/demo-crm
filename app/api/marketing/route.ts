import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId parameter is required' },
        { status: 400 }
      );
    }

    const content = await query(
      `SELECT id, "companyId", "contentType", title, prompt, status, "createdAt", "updatedAt" FROM "MarketingContent" WHERE "companyId" = $1 ORDER BY "createdAt" DESC`,
      [companyId]
    );

    return NextResponse.json({
      success: true,
      content,
      count: content.length
    });
  } catch (error) {
    console.error('[Marketing] Fetch error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
