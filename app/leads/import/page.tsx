export default function ImportPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Import Leads</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <p className="text-gray-600 mb-4">
          CSV import functionality coming soon. This will support column mapping for custom fields.
        </p>
        <button
          className="btn btn-primary"
          disabled
        >
          Upload CSV
        </button>
      </div>
    </div>
  );
}
