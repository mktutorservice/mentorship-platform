'use client';

export default function CreateProfilePage() {
  return (
    <section className="max-w-lg mx-auto py-10 px-4 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Setup Your Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Complete your information to get started</p>
      </div>

      <form className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full text-sm p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 bg-gray-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
          <textarea
            rows={3}
            placeholder="Tell us a bit about yourself..."
            className="w-full text-sm p-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 bg-gray-50/50"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-xl transition shadow-sm"
        >
          Save Profile
        </button>
      </form>
    </section>
  );
}