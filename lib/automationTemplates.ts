export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  nodes: any[];
  edges: any[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  industryFit: string[];
}

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'lead-routing',
    name: 'Lead Routing',
    description: 'Automatically assign high-quality leads to available sales executives using round-robin or scoring methods',
    category: 'Sales',
    icon: '🎯',
    difficulty: 'beginner',
    industryFit: ['SaaS', 'B2B', 'Services'],
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: { label: 'Lead Created', type: 'trigger', config: {} },
      },
      {
        id: 'condition_1',
        type: 'condition',
        position: { x: 50, y: 150 },
        data: { label: 'Score Check', type: 'condition', config: { operator: '>', value: 50 } },
      },
      {
        id: 'action_1',
        type: 'action',
        position: { x: -100, y: 250 },
        data: { label: 'Assign Lead', type: 'action', config: { method: 'round-robin' } },
      },
      {
        id: 'action_2',
        type: 'action',
        position: { x: -100, y: 350 },
        data: { label: 'Send Email', type: 'action', config: { template: 'welcome' } },
      },
      {
        id: 'action_3',
        type: 'action',
        position: { x: 150, y: 250 },
        data: { label: 'Add to Campaign', type: 'action', config: { campaignId: 'nurture' } },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'condition_1', label: 'default' },
      { id: 'e2', source: 'condition_1', target: 'action_1', label: 'yes' },
      { id: 'e3', source: 'condition_1', target: 'action_3', label: 'no' },
      { id: 'e4', source: 'action_1', target: 'action_2', label: 'default' },
    ],
  },
  {
    id: 'nurture-sequence',
    name: 'Nurture Sequence',
    description: 'Send automated multi-touch email sequence to unqualified leads with delays between emails',
    category: 'Marketing',
    icon: '📧',
    difficulty: 'intermediate',
    industryFit: ['SaaS', 'E-commerce', 'Services'],
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: { label: 'Lead Created', type: 'trigger', config: {} },
      },
      {
        id: 'action_1',
        type: 'action',
        position: { x: 50, y: 150 },
        data: { label: 'Send Email', type: 'action', config: { template: 'welcome' } },
      },
      {
        id: 'delay_1',
        type: 'delay',
        position: { x: 50, y: 250 },
        data: { label: 'Delay', type: 'delay', config: { delay: 2 } },
      },
      {
        id: 'action_2',
        type: 'action',
        position: { x: 50, y: 350 },
        data: { label: 'Send Email', type: 'action', config: { template: 'product-info' } },
      },
      {
        id: 'delay_2',
        type: 'delay',
        position: { x: 50, y: 450 },
        data: { label: 'Delay', type: 'delay', config: { delay: 3 } },
      },
      {
        id: 'action_3',
        type: 'action',
        position: { x: 50, y: 550 },
        data: { label: 'Send Email', type: 'action', config: { template: 'special-offer' } },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'action_1', label: 'default' },
      { id: 'e2', source: 'action_1', target: 'delay_1', label: 'default' },
      { id: 'e3', source: 'delay_1', target: 'action_2', label: 'default' },
      { id: 'e4', source: 'action_2', target: 'delay_2', label: 'default' },
      { id: 'e5', source: 'delay_2', target: 'action_3', label: 'default' },
    ],
  },
  {
    id: 'deal-sla',
    name: 'Deal SLA Enforcement',
    description: 'Auto-escalate stalled deals and send reminders when deals lack activity for specified periods',
    category: 'Sales',
    icon: '⏰',
    difficulty: 'intermediate',
    industryFit: ['B2B', 'Enterprise'],
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: { label: 'Deal Moved', type: 'trigger', config: {} },
      },
      {
        id: 'action_1',
        type: 'action',
        position: { x: 50, y: 150 },
        data: { label: 'Create Task', type: 'action', config: { title: 'Follow up on proposal', days: 0 } },
      },
      {
        id: 'delay_1',
        type: 'delay',
        position: { x: 50, y: 250 },
        data: { label: 'Delay', type: 'delay', config: { delay: 5 } },
      },
      {
        id: 'action_2',
        type: 'action',
        position: { x: 50, y: 350 },
        data: { label: 'Send Email', type: 'action', config: { template: 'reminder' } },
      },
      {
        id: 'delay_2',
        type: 'delay',
        position: { x: 50, y: 450 },
        data: { label: 'Delay', type: 'delay', config: { delay: 5 } },
      },
      {
        id: 'action_3',
        type: 'action',
        position: { x: 50, y: 550 },
        data: { label: 'Notify Team', type: 'action', config: { message: 'Deal at risk - escalate' } },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'action_1', label: 'default' },
      { id: 'e2', source: 'action_1', target: 'delay_1', label: 'default' },
      { id: 'e3', source: 'delay_1', target: 'action_2', label: 'default' },
      { id: 'e4', source: 'action_2', target: 'delay_2', label: 'default' },
      { id: 'e5', source: 'delay_2', target: 'action_3', label: 'default' },
    ],
  },
  {
    id: 'lead-scoring',
    name: 'Lead Scoring Automation',
    description: 'Automatically score leads based on engagement and auto-qualify high-scoring leads',
    category: 'Sales',
    icon: '⭐',
    difficulty: 'advanced',
    industryFit: ['SaaS', 'B2B'],
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: { label: 'Lead Updated', type: 'trigger', config: {} },
      },
      {
        id: 'action_1',
        type: 'action',
        position: { x: 50, y: 150 },
        data: { label: 'Update Field', type: 'action', config: { field: 'score', value: '+5' } },
      },
      {
        id: 'condition_1',
        type: 'condition',
        position: { x: 50, y: 250 },
        data: { label: 'Score Check', type: 'condition', config: { operator: '>', value: 75 } },
      },
      {
        id: 'action_2',
        type: 'action',
        position: { x: -100, y: 350 },
        data: { label: 'Change Status', type: 'action', config: { status: 'qualified' } },
      },
      {
        id: 'action_3',
        type: 'action',
        position: { x: -100, y: 450 },
        data: { label: 'Assign Lead', type: 'action', config: { method: 'highest-score' } },
      },
      {
        id: 'action_4',
        type: 'action',
        position: { x: 150, y: 350 },
        data: { label: 'Send Email', type: 'action', config: { template: 'warm-lead' } },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'action_1', label: 'default' },
      { id: 'e2', source: 'action_1', target: 'condition_1', label: 'default' },
      { id: 'e3', source: 'condition_1', target: 'action_2', label: 'yes' },
      { id: 'e4', source: 'action_2', target: 'action_3', label: 'default' },
      { id: 'e5', source: 'condition_1', target: 'action_4', label: 'no' },
    ],
  },
  {
    id: 'hot-lead-alert',
    name: 'Hot Lead Alert',
    description: 'Instantly notify team and create task when high-quality lead is detected',
    category: 'Sales',
    icon: '🔥',
    difficulty: 'beginner',
    industryFit: ['SaaS', 'B2B', 'Enterprise'],
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: { label: 'Lead Created', type: 'trigger', config: {} },
      },
      {
        id: 'condition_1',
        type: 'condition',
        position: { x: 50, y: 150 },
        data: { label: 'Score Check', type: 'condition', config: { operator: '>', value: 80 } },
      },
      {
        id: 'action_1',
        type: 'action',
        position: { x: -100, y: 250 },
        data: { label: 'Notify Team', type: 'action', config: { message: 'Hot lead alert!' } },
      },
      {
        id: 'action_2',
        type: 'action',
        position: { x: 50, y: 250 },
        data: { label: 'Create Task', type: 'action', config: { title: 'Call hot lead', priority: 'high' } },
      },
      {
        id: 'action_3',
        type: 'action',
        position: { x: 150, y: 250 },
        data: { label: 'Slack Message', type: 'action', config: { channel: '#hot-leads' } },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'condition_1', label: 'default' },
      { id: 'e2', source: 'condition_1', target: 'action_1', label: 'yes' },
      { id: 'e3', source: 'condition_1', target: 'action_2', label: 'yes' },
      { id: 'e4', source: 'condition_1', target: 'action_3', label: 'yes' },
    ],
  },
  {
    id: 'follow-up-reminder',
    name: 'Follow-up Reminders',
    description: 'Send automated follow-up reminders after specific actions or time periods',
    category: 'Sales',
    icon: '🔔',
    difficulty: 'beginner',
    industryFit: ['SaaS', 'B2B', 'Services'],
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: { label: 'Lead Updated', type: 'trigger', config: {} },
      },
      {
        id: 'delay_1',
        type: 'delay',
        position: { x: 50, y: 150 },
        data: { label: 'Delay', type: 'delay', config: { delay: 3 } },
      },
      {
        id: 'action_1',
        type: 'action',
        position: { x: 50, y: 250 },
        data: { label: 'Send Email', type: 'action', config: { template: 'follow-up' } },
      },
      {
        id: 'action_2',
        type: 'action',
        position: { x: 50, y: 350 },
        data: { label: 'Create Task', type: 'action', config: { title: 'Follow-up call' } },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'delay_1', label: 'default' },
      { id: 'e2', source: 'delay_1', target: 'action_1', label: 'default' },
      { id: 'e3', source: 'action_1', target: 'action_2', label: 'default' },
    ],
  },
  {
    id: 'qualification-flow',
    name: 'Qualification Flow',
    description: 'Multi-step qualification process with conditions and branch logic',
    category: 'Sales',
    icon: '✅',
    difficulty: 'advanced',
    industryFit: ['B2B', 'Enterprise', 'SaaS'],
    nodes: [
      {
        id: 'trigger_1',
        type: 'trigger',
        position: { x: 50, y: 50 },
        data: { label: 'Lead Created', type: 'trigger', config: {} },
      },
      {
        id: 'condition_1',
        type: 'condition',
        position: { x: 50, y: 150 },
        data: { label: 'Score Check', type: 'condition', config: { operator: '>', value: 40 } },
      },
      {
        id: 'action_1',
        type: 'action',
        position: { x: -100, y: 250 },
        data: { label: 'Send Email', type: 'action', config: { template: 'qualify' } },
      },
      {
        id: 'action_2',
        type: 'action',
        position: { x: 150, y: 250 },
        data: { label: 'Add to Campaign', type: 'action', config: { campaignId: 'nurture' } },
      },
      {
        id: 'delay_1',
        type: 'delay',
        position: { x: -100, y: 350 },
        data: { label: 'Delay', type: 'delay', config: { delay: 5 } },
      },
      {
        id: 'condition_2',
        type: 'condition',
        position: { x: -100, y: 450 },
        data: { label: 'Score Check', type: 'condition', config: { operator: '>', value: 70 } },
      },
      {
        id: 'action_3',
        type: 'action',
        position: { x: -100, y: 550 },
        data: { label: 'Assign Lead', type: 'action', config: { method: 'round-robin' } },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger_1', target: 'condition_1', label: 'default' },
      { id: 'e2', source: 'condition_1', target: 'action_1', label: 'yes' },
      { id: 'e3', source: 'condition_1', target: 'action_2', label: 'no' },
      { id: 'e4', source: 'action_1', target: 'delay_1', label: 'default' },
      { id: 'e5', source: 'delay_1', target: 'condition_2', label: 'default' },
      { id: 'e6', source: 'condition_2', target: 'action_3', label: 'yes' },
    ],
  },
];

export function getTemplateById(id: string): AutomationTemplate | undefined {
  return AUTOMATION_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): AutomationTemplate[] {
  return AUTOMATION_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplatesByIndustry(industry: string): AutomationTemplate[] {
  return AUTOMATION_TEMPLATES.filter((t) => t.industryFit.includes(industry));
}
