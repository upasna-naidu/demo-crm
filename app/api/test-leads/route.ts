import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing leads query...');

    const leads = await query(`SELECT * FROM "Lead" LIMIT 5`);
    console.log('📋 Raw leads:', leads);

    return NextResponse.json({
      success: true,
      count: leads.length,
      leads: leads,
      message: 'Raw query test successful'
    });
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
