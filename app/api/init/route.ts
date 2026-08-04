import { initializeRolesAndPermissions } from '@/lib/roles';

export async function GET() {
  try {
    await initializeRolesAndPermissions();
    return Response.json({ success: true, message: 'Initialization complete' });
  } catch (error) {
    console.error('Error initializing:', error);
    return Response.json({ error: 'Initialization failed' }, { status: 500 });
  }
}
