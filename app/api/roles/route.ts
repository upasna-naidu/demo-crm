import { query } from '@/lib/db';

export async function GET() {
  try {
    const roles = await query(
      `SELECT id, name, description FROM "Role" ORDER BY name ASC`
    );

    return Response.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return Response.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}
