export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s your self-care overview for today.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">
          Your dashboard will appear here once you start tracking goals and reflections.
        </p>
      </div>
    </div>
  );
}
