import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const stageCount = await prisma.stage.count();
    const userCount = await prisma.user.count();

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      stageCount,
      userCount,
      message: 'Database connection works!',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
