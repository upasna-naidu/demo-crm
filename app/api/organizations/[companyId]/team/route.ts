import { query, run, queryOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET team members for company
export async function GET(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;

    const teamMembers = await query(
      `SELECT u.id, u.name, u.email, cu."roleId", r.name as roleName, cu."isAdmin"
       FROM "User" u
       JOIN "CompanyUser" cu ON u.id = cu."userId"
       JOIN "Role" r ON cu."roleId" = r.id
       WHERE cu."companyId" = $1
       ORDER BY cu."isAdmin" DESC, u.name ASC`,
      [companyId]
    );

    return Response.json({ teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return Response.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

// POST invite new user to company
export async function POST(
  request: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const { email, name, roleId } = await request.json();

    if (!email || !name || !roleId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await queryOne(
      `SELECT id FROM "User" WHERE email = $1`,
      [email]
    );

    const userId = user?.id || `user_${uuidv4()}`;

    // Create user if doesn't exist
    if (!user) {
      await run(
        `INSERT INTO "User" (id, name, email, "createdAt")
         VALUES ($1, $2, $3, $4)`,
        [userId, name, email, new Date().toISOString()]
      );
    }

    // Add user to company
    const companyUserId = `cu_${uuidv4()}`;
    await run(
      `INSERT INTO "CompanyUser" (id, "userId", "companyId", "roleId", "isAdmin")
       VALUES ($1, $2, $3, $4, $5)`,
      [companyUserId, userId, companyId, roleId, 0]
    );

    return Response.json({
      success: true,
      user: { id: userId, name, email, roleId },
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    return Response.json({ error: 'Failed to invite user' }, { status: 500 });
  }
}
