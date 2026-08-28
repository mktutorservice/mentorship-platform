'use client';

export default function SettingsPage() {
  return (
    <section className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-xs text-gray-500">Receive updates about activity and messages</p>
          </div>
          <input type="checkbox" className="rounded text-gray-900 focus:ring-gray-900 accent-gray-900" defaultChecked />
        </div>

        <div className="flex justify-between items-center py-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Public Visibility</h3>
            <p className="text-xs text-gray-500">Allow users to discover your mentor profile</p>
          </div>
          <input type="checkbox" className="rounded text-gray-900 focus:ring-gray-900 accent-gray-900" defaultChecked />
        </div>
      </div>
    </section>
  );
}