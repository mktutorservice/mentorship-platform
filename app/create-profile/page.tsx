'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function CreateProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Female',
    department: 'Software Engineering',
    phone: '+251 9',
    activity_status: 'Available for tutoring sessions',
    fee_status: 'Per Hour',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      alert('Please log in first to create a profile.');
      setLoading(false);
      router.push('/login');
      return;
    }

    const payload = {
      id: session.user.id,
      name: formData.name,
      gender: formData.gender,
      department: formData.department,
      phone: formData.phone,
      activity_status: formData.activity_status,
      fee_status: formData.fee_status,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });

    setLoading(false);

    if (error) {
      alert('Error saving profile: ' + error.message);
    } else {
      router.push('/feed');
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f17] text-white flex flex-col justify-center py-10 px-4">
      <section className="max-w-lg mx-auto w-full space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Setup Your Profile</h1>
            <p className="text-xs text-gray-400 mt-1">Complete your information to join the mentorship feed</p>
          </div>
          <Link
            href="/feed"
            className="text-xs font-semibold bg-[#252533] hover:bg-[#B38728] text-white px-3 py-1.5 rounded-full border border-white/10 transition"
          >
            ← Cancel
          </Link>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-[#171722] p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Yordanos Yohannes"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-3 rounded-2xl border border-white/10 bg-[#252533] text-white focus:outline-none focus:border-[#B38728]"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full text-xs p-3 rounded-2xl border border-white/10 bg-[#252533] text-white focus:outline-none focus:border-[#B38728]"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full text-xs p-3 rounded-2xl border border-white/10 bg-[#252533] text-white focus:outline-none focus:border-[#B38728]"
            >
              <option value="Software Engineering">Software Engineering</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Biomedical Engineering">Biomedical Engineering</option>
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Phone Number</label>
            <input
              type="text"
              required
              placeholder="+251 912345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full text-xs p-3 rounded-2xl border border-white/10 bg-[#252533] text-white focus:outline-none focus:border-[#B38728] font-mono"
            />
          </div>

          {/* Activity Status / Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Status / Headline</label>
            <input
              type="text"
              placeholder="e.g. Available for tutoring sessions"
              value={formData.activity_status}
              onChange={(e) => setFormData({ ...formData, activity_status: e.target.value })}
              className="w-full text-xs p-3 rounded-2xl border border-white/10 bg-[#252533] text-white focus:outline-none focus:border-[#B38728]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B38728] hover:bg-[#966f1f] disabled:opacity-50 text-black text-xs font-bold py-3 rounded-full transition shadow-lg mt-4 cursor-pointer uppercase tracking-wider"
          >
            {loading ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </form>
      </section>
    </main>
  );
}