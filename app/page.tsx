export default function Home() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Smart Layover Finder</h1>
      <p className="text-gray-600 mb-6">Find cheaper trips by combining separate legs with smart layovers.</p>
      <div className="flex gap-3">
        <a className="px-4 py-2 bg-black text-white rounded" href="/login">Sign in</a>
        <a className="px-4 py-2 border rounded" href="/app">Open app</a>
      </div>
    </main>
  );
}
