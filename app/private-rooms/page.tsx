'use client';

export default function PrivateRoomsPage() {
  return (
    <section className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Private Rooms</h1>
        <p className="text-sm text-gray-500 mt-1">Exclusive 1-on-1 and restricted group sessions</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm text-center space-y-3">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-600 font-bold">
        
        </div>
        <h2 className="text-base font-bold text-gray-900">No Active Private Sessions</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          You currently don't have any private mentorship room invitations or active sessions.
        </p>
      </div>
    </section>
  );
}