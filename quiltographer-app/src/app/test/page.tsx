export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 p-8">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tailwind Test</h1>
        <p className="text-gray-600 mb-4">
          If you can see this with blue background and white card, Tailwind is working!
        </p>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-red-500 rounded"></div>
          <div className="w-8 h-8 bg-green-500 rounded"></div>
          <div className="w-8 h-8 bg-blue-500 rounded"></div>
        </div>
      </div>
    </div>
  );
}
