import { NextRequest, NextResponse } from 'next/server';
import { run, query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { companyId, contentType, prompt } = await request.json();

    if (!companyId || !contentType || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: companyId, contentType, prompt' },
        { status: 400 }
      );
    }

    // Get company details
    const company = await query(`SELECT id, name, industry, description FROM "Company" WHERE id = $1`, [companyId]);
    if (company.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const companyData = company[0];

    // Generate content based on type
    let title = '';
    let content = '';

    switch (contentType) {
      case 'email_campaign':
        title = `Email Campaign - ${companyData.name}`;
        content = generateEmailCampaign(companyData, prompt);
        break;
      case 'social_posts':
        title = `Social Media Posts - ${companyData.name}`;
        content = generateSocialPosts(companyData, prompt);
        break;
      case 'landing_page':
        title = `Landing Page Copy - ${companyData.name}`;
        content = generateLandingPageCopy(companyData, prompt);
        break;
      case 'blog_post':
        title = `Blog Post - ${companyData.name}`;
        content = generateBlogPost(companyData, prompt);
        break;
      default:
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Save to database
    const contentId = `content-${Date.now()}`;
    await run(
      `INSERT INTO "MarketingContent" (id, "companyId", "contentType", title, content, prompt, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [contentId, companyId, contentType, title, content, prompt, 'draft']
    );

    return NextResponse.json({
      success: true,
      contentId,
      title,
      content,
      contentType,
      companyName: companyData.name
    });
  } catch (error) {
    console.error('[Marketing] Generation error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

function generateEmailCampaign(company: any, prompt: string): string {
  return `
📧 EMAIL CAMPAIGN FOR ${company.name}

Subject Line: Unlock Growth with ${company.name}'s ${prompt}

---

Hi [First Name],

We know you're looking for ${prompt}.

At ${company.name}, we specialize in helping ${company.industry || 'businesses'} like yours achieve their goals. Our approach is proven to deliver results.

Here's what makes us different:
• Deep expertise in ${company.industry || 'the industry'}
• Proven track record with companies like yours
• Custom solutions tailored to your needs

Ready to see the difference? Let's talk.

[CTA Button: Schedule a Demo]

Best regards,
${company.name} Team

---

💡 Tips: Personalize names, adjust tone based on audience, test different subject lines.
  `.trim();
}

function generateSocialPosts(company: any, prompt: string): string {
  return `
📱 SOCIAL MEDIA POSTS FOR ${company.name}

--- POST 1 (LinkedIn) ---
🚀 ${prompt}

${company.name} is redefining how ${company.industry || 'businesses'} approach growth.

Learn more about our approach:
[Link to resource]

#${company.name.replace(/\s+/g, '')} #${company.industry?.replace(/\s+/g, '') || 'Business'}

--- POST 2 (Twitter/X) ---
💡 Pro tip: ${prompt}

That's why ${company.name} exists. 🎯

--- POST 3 (Facebook) ---
🎉 Did you know?

${prompt} can transform your ${company.industry || 'business'}.

At ${company.name}, we've helped hundreds achieve this. You could be next.

[Learn How]

---

✨ Best practices: Post 2-3x weekly, engage with comments, use relevant hashtags.
  `.trim();
}

function generateLandingPageCopy(company: any, prompt: string): string {
  return `
🌐 LANDING PAGE COPY FOR ${company.name}

HEADLINE:
${prompt} - The ${company.name} Difference

SUBHEADLINE:
Transform your ${company.industry || 'business'} with proven strategies from industry leaders.

SECTION 1: THE PROBLEM
Many ${company.industry || 'businesses'} struggle with ${prompt}.
It's costing them time, money, and growth opportunities.

SECTION 2: THE SOLUTION
${company.name} provides an integrated approach:
✓ Expert consultation tailored to your needs
✓ Proven methodology from 100+ successful implementations
✓ Dedicated support throughout your journey

SECTION 3: WHY ${company.name}?
${company.description || 'We combine industry expertise with cutting-edge solutions.'}

SECTION 4: SOCIAL PROOF
Trusted by leading ${company.industry || 'companies'} worldwide.
[Client logos]

CTA BUTTON: Start Your Transformation Today

FOOTER: Privacy Policy | Terms | Contact

---

🎯 Conversion tips: Clear value prop, social proof, single CTA, mobile optimized.
  `.trim();
}

function generateBlogPost(company: any, prompt: string): string {
  return `
📝 BLOG POST FOR ${company.name}

TITLE:
${prompt}: A Complete Guide for ${company.industry || 'Modern Businesses'}

META DESCRIPTION:
Learn how ${company.name} helps ${company.industry || 'businesses'} master ${prompt}. Expert insights and actionable strategies included.

---

INTRODUCTION:
${prompt} is more important than ever for ${company.industry || 'businesses'} looking to stay competitive.

In this guide, we'll explore:
• What makes ${prompt} critical today
• Common mistakes to avoid
• Best practices from industry leaders
• How ${company.name} can help

---

SECTION 1: WHY ${prompt} MATTERS
[Your insights here]

SECTION 2: KEY STRATEGIES
1. Strategy One
2. Strategy Two
3. Strategy Three

SECTION 3: COMMON PITFALLS
❌ Mistake 1: [Explanation]
❌ Mistake 2: [Explanation]

SECTION 4: THE ${company.name} APPROACH
${company.description || 'We specialize in delivering proven results.'}

---

CTA:
Ready to implement these strategies? [Schedule a consultation with our team]

TAGS: ${prompt}, ${company.industry || 'business'}, strategy, growth

---

✍️ SEO tips: Target keywords naturally, include headers, write 1500+ words, add internal links.
  `.trim();
}
