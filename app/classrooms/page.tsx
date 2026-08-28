'use client';

export default function ClassroomsPage() {
  return (
    <section className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Classrooms</h1>
          <p className="text-sm text-gray-500 mt-1">Join structured group learning spaces</p>
        </div>
        <button className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-sm">
          + Create Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
            Public
          </span>
          <h2 className="text-lg font-bold text-gray-900">Web Development Fundamentals</h2>
          <p className="text-sm text-gray-600">Explore full-stack concepts, state management, and modern UI practices.</p>
        </div>
      </div>
    </section>
  );
}