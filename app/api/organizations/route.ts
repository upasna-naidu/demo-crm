import { query, run, queryOne } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { ROLES } from '@/lib/roles';

// GET all organizations (super admin only)
export async function GET() {
  try {
    const organizations = await query(
      `SELECT * FROM "Company" ORDER BY "createdAt" DESC`
    );
    return Response.json({ organizations });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

// POST create new organization with admin user
export async function POST(request: Request) {
  try {
    const { companyName, adminEmail, adminName } = await request.json();

    if (!companyName || !adminEmail || !adminName) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const companyId = `company_${uuidv4()}`;
    const adminId = `user_${uuidv4()}`;

    // Create company
    await run(
      `INSERT INTO "Company" (id, name, "adminId", "createdAt")
       VALUES ($1, $2, $3, $4)`,
      [companyId, companyName, adminId, new Date().toISOString()]
    );

    // Create admin user
    await run(
      `INSERT INTO "User" (id, name, email, "roleId", "createdAt")
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, adminName, adminEmail, ROLES.SUPER_ADMIN, new Date().toISOString()]
    );

    // Add admin to company with org_admin role
    const companyUserId = `cu_${uuidv4()}`;
    await run(
      `INSERT INTO "CompanyUser" (id, "userId", "companyId", "roleId", "isAdmin")
       VALUES ($1, $2, $3, $4, $5)`,
      [companyUserId, adminId, companyId, ROLES.ORG_ADMIN, 1]
    );

    return Response.json({
      success: true,
      organization: { id: companyId, name: companyName, adminId },
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return Response.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
