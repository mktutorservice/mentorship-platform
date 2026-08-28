'use client';

export default function MentorsPage() {
  return (
    <section className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Available Mentors</h1>
        <p className="text-sm text-gray-500 mt-1">Connect with industry peers and experts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-300/60 flex items-center justify-center font-bold text-gray-700">
            JD
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-base font-bold text-gray-900">Software Mentor</h2>
            <p className="text-xs text-gray-500">Full-Stack & Systems Architecture</p>
            <button className="mt-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg border border-gray-300/60 transition">
              Request Mentorship
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}