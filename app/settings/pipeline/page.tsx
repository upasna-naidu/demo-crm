export default function PipelinePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Pipeline & Custom Fields</h1>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Stages</h2>
          <p className="text-gray-600 mb-4">
            Manage your sales pipeline stages here. Coming soon: drag to reorder, add/edit/delete stages.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Custom Fields</h2>
          <p className="text-gray-600 mb-4">
            Add custom fields to leads without code changes. Coming soon: create text, number, dropdown, and date fields.
          </p>
        </div>
      </div>
    </div>
  );
}
