export default function IntegrationsPage() {
  const integrations = [
    {
      name: 'Calling Tools',
      description: 'Integrate with Twilio, Vonage, or other VoIP platforms',
      icon: '📞',
    },
    {
      name: 'Marketing Tools',
      description: 'Connect with email marketing and automation platforms',
      icon: '📧',
    },
    {
      name: 'Lead Generation',
      description: 'Sync leads from web forms and lead capture tools',
      icon: '🎯',
    },
    {
      name: 'Workflow Management',
      description: 'Automate workflows with Zapier, Make, or similar platforms',
      icon: '⚙️',
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Integrations</h1>
      <p className="text-gray-600 mb-8">
        Connect your CRM with other tools and services
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-3">{integration.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{integration.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{integration.description}</p>
            <button
              disabled
              className="text-gray-500 text-sm"
            >
              Coming soon
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
