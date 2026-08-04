import { query, run, queryOne } from '@/lib/db';

// PUT change user role
export async function PUT(
  request: Request,
  { params }: { params: { companyId: string; userId: string } }
) {
  try {
    const { companyId, userId } = params;
    const { roleId } = await request.json();

    if (!roleId) {
      return Response.json({ error: 'Missing roleId' }, { status: 400 });
    }

    await run(
      `UPDATE "CompanyUser" SET "roleId" = $1
       WHERE "userId" = $2 AND "companyId" = $3`,
      [roleId, userId, companyId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return Response.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

// DELETE remove user from company
export async function DELETE(
  request: Request,
  { params }: { params: { companyId: string; userId: string } }
) {
  try {
    const { companyId, userId } = params;

    await run(
      `DELETE FROM "CompanyUser"
       WHERE "userId" = $1 AND "companyId" = $2`,
      [userId, companyId]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error removing user:', error);
    return Response.json({ error: 'Failed to remove user' }, { status: 500 });
  }
}
