import { AUTOMATION_TEMPLATES, getTemplatesByCategory, getTemplatesByIndustry } from '@/lib/automationTemplates';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const industry = searchParams.get('industry');

    let templates = AUTOMATION_TEMPLATES;

    if (category) {
      templates = getTemplatesByCategory(category);
    }

    if (industry) {
      templates = getTemplatesByIndustry(industry);
    }

    return Response.json({ templates });
  } catch (error) {
    console.error('[Templates API] Error:', error);
    return Response.json({ templates: [] });
  }
}
