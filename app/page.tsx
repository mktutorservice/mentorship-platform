'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // User Profile State
  const [role, setRole] = useState<string>('STUDENT');
  const [userName, setUserName] = useState<string>('Alex Johnson');
  const [userStatus, setUserStatus] = useState<string>('Available for tutoring sessions');
  const [feeStatus, setFeeStatus] = useState<string>('Per Hour');
  const [gender, setGender] = useState<string>('Prefer not to say');
  const [privacy, setPrivacy] = useState<string>('Public');
  const [avatarUrl, setAvatarUrl] = useState<string>('/card1.jpg');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Contact Info State
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // UI Controls
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showContactsModal, setShowContactsModal] = useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [postContent, setPostContent] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    async function loadUserProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const currentUid = session.user.id;
      setUserId(currentUid);
      setEmail(session.user.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUid)
        .maybeSingle();

      if (profile) {
        if (profile.name) setUserName(profile.name);
        if (profile.role) setRole(profile.role);
        if (profile.activity_status) setUserStatus(profile.activity_status);
        if (profile.fee_status) setFeeStatus(profile.fee_status);
        if (profile.gender) setGender(profile.gender);
        if (profile.profile_picture) setAvatarUrl(profile.profile_picture);
        if (profile.phone) setPhone(profile.phone);
        if (profile.is_verified) setIsVerified(profile.is_verified);
      }
    }

    loadUserProfile();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);

    const payload = {
      name: userName,
      activity_status: userStatus,
      fee_status: feeStatus,
      gender: gender,
      profile_picture: avatarUrl,
      phone: phone,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId);

    setSaving(false);

    if (error) {
      alert(`Error updating profile: ${error.message}`);
    } else {
      setShowSettings(false);
      alert('Profile updated successfully!');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || !userId) return;

    const { error } = await supabase.from('posts').insert({
      author_id: userId,
      content: postContent.trim(),
      type: 'TEXT',
      visibility: 'PUBLIC'
    });

    if (error) {
      alert(`Failed to publish post: ${error.message}`);
    } else {
      alert('Post published to community feed!');
      setPostContent('');
      setShowPostModal(false);
    }
  };

  const toggleVerification = async () => {
    const nextStatus = !isVerified;
    setIsVerified(nextStatus);
    if (userId) {
      await supabase.from('profiles').update({ is_verified: nextStatus }).eq('id', userId);
    }
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen bg-[#0d0e15] text-white selection:bg-[#B38728] selection:text-white overflow-hidden pb-16 font-sans">
      
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/bg-tech.jpg"
          alt="Profile Background"
          fill
          priority
          className="object-cover object-center opacity-20 mix-blend-screen transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0e15]/80 via-[#0d0e15]/60 to-[#0d0e15]" />
      </div>

      {/* TOP NAVIGATION ICONS */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-end">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowContactsModal(true)}
            className="p-2 rounded-full hover:bg-white/10 transition duration-300 relative group cursor-pointer"
            title="My Contacts"
          >
            <Image 
              src="/contacts.png" 
              alt="My Contacts" 
              width={24} 
              height={24} 
              className="object-contain"
            />
          </button>

          <button 
            onClick={toggleVerification}
            className="p-2 rounded-full hover:bg-white/10 transition duration-300 relative group cursor-pointer"
            title={isVerified ? "Account Verified" : "Verify Account"}
          >
            <Image 
              src={isVerified ? "/verified.png" : "/unverified.png"} 
              alt={isVerified ? "Verified User" : "Unverified User"} 
              width={26} 
              height={26} 
              className="object-contain"
            />
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-white/10 transition duration-300 cursor-pointer"
            title="Settings"
          >
            <Image 
              src="/settings.png" 
              alt="Settings" 
              width={22} 
              height={22} 
              className="object-contain"
            />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 space-y-8">
        
        {/* Profile Card Header (POSITIONED AT TOP) */}
        <div className="bg-[#151622] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#B38728]/50 bg-[#252538] shadow-2xl flex items-center justify-center font-black text-[#B38728] text-3xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0)
              )}
            </div>
            {isVerified && (
              <span className="absolute -bottom-2 -right-2 bg-[#B38728] text-black w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg border-2 border-[#141420]">
                ✓
              </span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{userName}</h2>
              <span className="text-[10px] px-3 py-1 rounded-md font-bold tracking-wider uppercase bg-[#B38728]/20 text-[#FCF6BA] border border-[#B38728]/40">
                {role}
              </span>
              <span className="text-[10px] px-3 py-1 rounded-md font-bold tracking-wider uppercase bg-white/5 text-gray-400 border border-white/10">
                {privacy}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-400 italic max-w-xl">
              "{userStatus}"
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-gray-300 pt-1">
              <span><strong className="text-white">Gender:</strong> {gender}</span>
              <span className="text-white/20">•</span>
              <span><strong className="text-white">Fee Status:</strong> {feeStatus}</span>
            </div>
          </div>

          {/* Quick Action to Add Post directly within profile card */}
          <div className="self-end md:self-center">
            <button
              onClick={() => setShowPostModal(true)}
              className="text-xs font-bold bg-[#B38728] hover:bg-[#c29532] text-black px-4 py-2 rounded-xl transition shadow-lg cursor-pointer"
            >
              + Add Post
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {showSettings && (
          <div className="bg-[#151622] border border-[#B38728]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <h3 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <span>⚙️</span> Edit Profile Details
            </h3>

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block text-gray-300 font-semibold">Full Name</label>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border border-white/10 text-white focus:outline-none focus:border-[#B38728]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-semibold">Status Tagline</label>
                <input 
                  type="text"
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border border-white/10 text-white focus:outline-none focus:border-[#B38728]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-semibold">Fee Structure</label>
                <select
                  value={feeStatus}
                  onChange={(e) => setFeeStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border border-white/10 text-white focus:outline-none focus:border-[#B38728]"
                >
                  <option value="Per Hour">Per Hour</option>
                  <option value="Per Week">Per Week</option>
                  <option value="Per Month">Per Month</option>
                  <option value="By Negotiation">By Negotiation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-semibold">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border border-white/10 text-white focus:outline-none focus:border-[#B38728]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-semibold">Profile Photo</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#0f0f17] border border-white/10 text-gray-300 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B38728] file:text-black cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-gray-300 font-semibold">Phone Contact</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border border-white/10 text-white focus:outline-none focus:border-[#B38728]"
                />
              </div>

              <div className="md:col-span-2 pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#B38728] hover:bg-[#c29532] text-black font-extrabold px-6 py-3 rounded-2xl transition shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CLASSROOMS & PRIVATE HUB VIDEO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          
          {/* CLASSROOMS VIDEO CARD */}
          <Link href="/classrooms" className="group block">
            <div className="bg-[#151622] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-between hover:border-[#B38728]/50 transition duration-300 shadow-2xl">
              <div className="relative w-full h-60 rounded-2xl overflow-hidden bg-black border border-white/5 shadow-inner">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out pointer-events-none"
                >
                  <source src="/classrooms.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="pt-5 text-center">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white group-hover:text-[#FCF6BA] transition">
                  CLASSROOMS
                </h3>
              </div>
            </div>
          </Link>

          {/* PRIVATE HUB VIDEO CARD */}
          <Link href="/private-rooms" className="group block">
            <div className="bg-[#151622] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-between hover:border-[#B38728]/50 transition duration-300 shadow-2xl">
              <div className="relative w-full h-60 rounded-2xl overflow-hidden bg-black border border-white/5 shadow-inner">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out pointer-events-none"
                >
                  <source src="/private-hub.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="pt-5 text-center">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white group-hover:text-[#FCF6BA] transition">
                  PRIVATE HUB
                </h3>
              </div>
            </div>
          </Link>

        </div>

      </div>

      {/* Contacts Modal */}
      {showContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#171722] border border-white/10 text-white p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white">Contact Details</h2>
              <button 
                onClick={() => setShowContactsModal(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#0f0f17] p-3.5 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] text-[#B38728] font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-white font-medium truncate">{email || 'Not provided'}</p>
              </div>

              <div className="bg-[#0f0f17] p-3.5 rounded-2xl border border-white/5 space-y-1">
                <p className="text-[10px] text-[#B38728] font-bold uppercase tracking-wider">Phone Number</p>
                <p className="text-white font-medium">{phone || 'Not set'}</p>
              </div>
            </div>

            <button
              onClick={() => setShowContactsModal(false)}
              className="w-full bg-[#B38728] text-black font-bold py-3 rounded-2xl text-xs uppercase cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#171722] border border-white/10 text-white p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-bold text-white">Create New Post</h2>
              <button 
                onClick={() => setShowPostModal(false)}
                className="text-gray-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                rows={4}
                placeholder="Share updates with your peers or mentors..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#0f0f17] text-white border border-white/10 focus:outline-none focus:border-[#B38728] text-xs resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 text-gray-300 text-xs font-semibold hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#B38728] text-black text-xs font-bold transition shadow-lg"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}