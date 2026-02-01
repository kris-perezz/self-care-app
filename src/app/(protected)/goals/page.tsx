export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Goals</h2>
        <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
          + New Goal
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
        <p className="text-sm text-gray-500">
          No goals yet. Create your first self-care goal to get started!
        </p>
      </div>
    </div>
  );
}
