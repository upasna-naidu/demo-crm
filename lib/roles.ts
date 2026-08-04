import { query, run, queryOne } from './db';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  SALES_MANAGER: 'sales_manager',
  SALES_PERSON: 'sales_person',
  MARKETING_MANAGER: 'marketing_manager',
  MARKETING_PERSON: 'marketing_person',
};

export const PERMISSIONS = {
  // Organization management
  CREATE_ORG: 'create_org',
  MANAGE_ORG: 'manage_org',
  VIEW_ORG: 'view_org',
  DELETE_ORG: 'delete_org',

  // Team management
  MANAGE_TEAM: 'manage_team',
  INVITE_USER: 'invite_user',
  REMOVE_USER: 'remove_user',
  CHANGE_USER_ROLE: 'change_user_role',

  // Lead management
  CREATE_LEAD: 'create_lead',
  VIEW_LEADS: 'view_leads',
  EDIT_LEAD: 'edit_lead',
  DELETE_LEAD: 'delete_lead',
  ASSIGN_LEAD: 'assign_lead',

  // Automation management
  MANAGE_AUTOMATIONS: 'manage_automations',
  VIEW_AUTOMATIONS: 'view_automations',
  EXECUTE_AUTOMATION: 'execute_automation',

  // Deal management
  CREATE_DEAL: 'create_deal',
  VIEW_DEALS: 'view_deals',
  EDIT_DEAL: 'edit_deal',

  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
};

// Initialize default roles and permissions
export async function initializeRolesAndPermissions() {
  try {
    // Check if roles already exist
    const existingRoles = await query(`SELECT COUNT(*) as count FROM "Role"`);
    if (existingRoles[0]?.count > 0) {
      console.log('Roles already initialized');
      return;
    }

    // Create roles
    const roleDefinitions = [
      { id: ROLES.SUPER_ADMIN, name: ROLES.SUPER_ADMIN, description: 'System administrator' },
      { id: ROLES.ORG_ADMIN, name: ROLES.ORG_ADMIN, description: 'Organization administrator' },
      { id: ROLES.SALES_MANAGER, name: ROLES.SALES_MANAGER, description: 'Sales team manager' },
      { id: ROLES.SALES_PERSON, name: ROLES.SALES_PERSON, description: 'Sales person' },
      { id: ROLES.MARKETING_MANAGER, name: ROLES.MARKETING_MANAGER, description: 'Marketing manager' },
      { id: ROLES.MARKETING_PERSON, name: ROLES.MARKETING_PERSON, description: 'Marketing person' },
    ];

    for (const role of roleDefinitions) {
      await run(
        `INSERT INTO "Role" (id, name, description) VALUES ($1, $2, $3)`,
        [role.id, role.name, role.description]
      );
    }

    // Create permissions
    const permissionDefinitions = Object.entries(PERMISSIONS).map(([key, value]) => ({
      id: value,
      name: value,
      description: key.replace(/_/g, ' '),
    }));

    for (const perm of permissionDefinitions) {
      await run(
        `INSERT INTO "Permission" (id, name, description) VALUES ($1, $2, $3)`,
        [perm.id, perm.name, perm.description]
      );
    }

    // Assign permissions to roles
    const rolePermissions: Record<string, string[]> = {
      [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions
      [ROLES.ORG_ADMIN]: [
        PERMISSIONS.MANAGE_ORG,
        PERMISSIONS.VIEW_ORG,
        PERMISSIONS.MANAGE_TEAM,
        PERMISSIONS.INVITE_USER,
        PERMISSIONS.REMOVE_USER,
        PERMISSIONS.CHANGE_USER_ROLE,
        PERMISSIONS.CREATE_LEAD,
        PERMISSIONS.VIEW_LEADS,
        PERMISSIONS.EDIT_LEAD,
        PERMISSIONS.ASSIGN_LEAD,
        PERMISSIONS.MANAGE_AUTOMATIONS,
        PERMISSIONS.VIEW_AUTOMATIONS,
        PERMISSIONS.CREATE_DEAL,
        PERMISSIONS.VIEW_DEALS,
        PERMISSIONS.EDIT_DEAL,
        PERMISSIONS.VIEW_ANALYTICS,
      ],
      [ROLES.SALES_MANAGER]: [
        PERMISSIONS.VIEW_ORG,
        PERMISSIONS.VIEW_LEADS,
        PERMISSIONS.EDIT_LEAD,
        PERMISSIONS.ASSIGN_LEAD,
        PERMISSIONS.VIEW_AUTOMATIONS,
        PERMISSIONS.CREATE_DEAL,
        PERMISSIONS.VIEW_DEALS,
        PERMISSIONS.EDIT_DEAL,
        PERMISSIONS.VIEW_ANALYTICS,
      ],
      [ROLES.SALES_PERSON]: [
        PERMISSIONS.VIEW_LEADS,
        PERMISSIONS.EDIT_LEAD,
        PERMISSIONS.CREATE_DEAL,
        PERMISSIONS.VIEW_DEALS,
        PERMISSIONS.EDIT_DEAL,
        PERMISSIONS.VIEW_ANALYTICS,
      ],
      [ROLES.MARKETING_MANAGER]: [
        PERMISSIONS.VIEW_ORG,
        PERMISSIONS.VIEW_LEADS,
        PERMISSIONS.MANAGE_AUTOMATIONS,
        PERMISSIONS.VIEW_AUTOMATIONS,
        PERMISSIONS.EXECUTE_AUTOMATION,
        PERMISSIONS.VIEW_ANALYTICS,
      ],
      [ROLES.MARKETING_PERSON]: [
        PERMISSIONS.VIEW_LEADS,
        PERMISSIONS.VIEW_AUTOMATIONS,
        PERMISSIONS.EXECUTE_AUTOMATION,
        PERMISSIONS.VIEW_ANALYTICS,
      ],
    };

    for (const [roleId, permissionIds] of Object.entries(rolePermissions)) {
      for (const permId of permissionIds) {
        const rpId = `${roleId}_${permId}`;
        await run(
          `INSERT INTO "RolePermission" (id, "roleId", "permissionId") VALUES ($1, $2, $3)`,
          [rpId, roleId, permId]
        );
      }
    }

    console.log('Roles and permissions initialized');
  } catch (error) {
    console.error('Error initializing roles and permissions:', error);
  }
}

// Get user's permissions
export async function getUserPermissions(userId: string, companyId?: string): Promise<string[]> {
  try {
    let sql = `
      SELECT DISTINCT p.name FROM "Permission" p
      JOIN "RolePermission" rp ON p.id = rp."permissionId"
      JOIN "Role" r ON rp."roleId" = r.id
      WHERE r.id = (
        SELECT "roleId" FROM "User" WHERE id = $1
      )
    `;

    // If company-specific, get role from CompanyUser
    if (companyId) {
      sql = `
        SELECT DISTINCT p.name FROM "Permission" p
        JOIN "RolePermission" rp ON p.id = rp."permissionId"
        WHERE rp."roleId" = (
          SELECT "roleId" FROM "CompanyUser"
          WHERE "userId" = $1 AND "companyId" = $2
        )
      `;
      return (await query(sql, [userId, companyId])).map((r: any) => r.name);
    }

    return (await query(sql, [userId])).map((r: any) => r.name);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

// Check if user has permission
export async function hasPermission(
  userId: string,
  permission: string,
  companyId?: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, companyId);
  return permissions.includes(permission);
}

// Get user's role
export async function getUserRole(userId: string, companyId?: string): Promise<string | null> {
  try {
    let result;
    if (companyId) {
      result = await queryOne(
        `SELECT r.name FROM "Role" r
         JOIN "CompanyUser" cu ON r.id = cu."roleId"
         WHERE cu."userId" = $1 AND cu."companyId" = $2`,
        [userId, companyId]
      );
    } else {
      result = await queryOne(
        `SELECT r.name FROM "Role" r
         JOIN "User" u ON r.id = u."roleId"
         WHERE u.id = $1`,
        [userId]
      );
    }
    return result?.name || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}
