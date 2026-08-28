'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [bgImage, setBgImage] = useState<string>('/hero-bg.jpg');

  // User Profile State
  const [role, setRole] = useState<string>('Student');
  const [userName, setUserName] = useState<string>('Alex Johnson');
  const [userStatus, setUserStatus] = useState<string>('Available for tutoring sessions');
  const [feeStatus, setFeeStatus] = useState<string>('Per Hour');
  const [gender, setGender] = useState<string>('Prefer not to say');
  const [privacy, setPrivacy] = useState<string>('Public');
  const [avatarUrl, setAvatarUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400');
  const [isVerified, setIsVerified] = useState<boolean>(false);

  // Contact Info State
  const [phone, setPhone] = useState<string>('+1 (555) 019-2834');
  const [email, setEmail] = useState<string>('alex.johnson@example.com');
  const [telegram, setTelegram] = useState<string>('@alex_tutor');

  // UI Controls
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showContactsModal, setShowContactsModal] = useState<boolean>(false);
  const [showFullPP, setShowFullPP] = useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [postContent, setPostContent] = useState<string>('');

  useEffect(() => {
    setMounted(true);

    const savedBg = localStorage.getItem('user_bg_image');
    if (savedBg) setBgImage(savedBg);

    // Load saved profile edits from localStorage
    const savedProfile = localStorage.getItem('user_profile_data');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.userName) setUserName(parsed.userName);
        if (parsed.userStatus) setUserStatus(parsed.userStatus);
        if (parsed.feeStatus) setFeeStatus(parsed.feeStatus);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.privacy) setPrivacy(parsed.privacy);
        if (parsed.avatarUrl) setAvatarUrl(parsed.avatarUrl);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.telegram) setTelegram(parsed.telegram);
        if (parsed.role) setRole(parsed.role);
      } catch (e) {
        console.error('Error parsing saved profile data:', e);
      }
    } else {
      async function loadSupabaseAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          if (metadata.role) setRole(metadata.role);
          if (metadata.full_name) setUserName(metadata.full_name);
          if (metadata.avatar_url) setAvatarUrl(metadata.avatar_url);
          if (session.user.email) setEmail(session.user.email);
        } else {
          const localRole = localStorage.getItem('user_role');
          if (localRole) setRole(localRole);
        }
      }
      loadSupabaseAuth();
    }
  }, []);

  // Convert uploaded image to Base64 so it persists in storage
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Explicit Save Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = {
      userName,
      userStatus,
      feeStatus,
      gender,
      privacy,
      avatarUrl,
      phone,
      email,
      telegram,
      role
    };
    
    localStorage.setItem('user_profile_data', JSON.stringify(updatedProfile));
    setShowSettings(false);
    alert('Profile changes saved successfully and persisted!');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    alert(`Post published by ${userName}!`);
    setPostContent('');
    setShowPostModal(false);
  };

  if (!mounted) return null;

  return (
    <main 
      className="min-h-screen bg-cover bg-center bg-fixed relative flex justify-center p-4 transition-all duration-500 py-10"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      <section className="relative z-10 w-full max-w-4xl space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#494D5F]/90 backdrop-blur-md text-white p-4 rounded-3xl border border-white/10 shadow-xl">
          <Link 
            href="/feed" 
            className="text-xs font-semibold bg-[#353846] hover:bg-[#8458B3] text-white px-4 py-2 rounded-full border border-white/10 transition"
          >
            ← Back to Home
          </Link>

          <h1 className="text-xl font-bold text-[#A0D2EB]">User Profile</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPostModal(true)}
              className="text-xs font-semibold bg-[#8458B3] hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] px-4 py-2 rounded-full transition cursor-pointer"
            >
              ➕ Add Post
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs font-semibold bg-[#353846] hover:bg-[#8458B3] text-white px-4 py-2 rounded-full border border-white/10 transition cursor-pointer"
            >
              {showSettings ? 'Close Settings' : '⚙️ Settings'}
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="bg-[#494D5F]/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/10 text-white flex flex-col md:flex-row items-center gap-6">
          <div className="relative cursor-pointer group" onClick={() => setShowFullPP(true)}>
            <img 
              src={avatarUrl} 
              alt={userName} 
              className="w-28 h-28 rounded-full object-cover border-4 border-[#8458B3] shadow-lg transition transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs text-white font-medium">
              View Photo
            </div>
            {isVerified && (
              <span className="absolute bottom-0 right-0 bg-[#A0D2EB] text-[#494D5F] p-1 rounded-full text-xs font-bold shadow">
                ✓
              </span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-2xl font-bold text-white">{userName}</h2>
              <span className="px-3 py-1 bg-[#8458B3] text-white text-xs font-semibold rounded-full uppercase">
                {role}
              </span>
              <span className="px-3 py-1 bg-[#353846] text-[#A0D2EB] text-xs font-semibold rounded-full">
                {privacy}
              </span>
            </div>
            
            <p className="text-sm text-[#E5EAF5] italic">"{userStatus}"</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-[#E5EAF5] pt-1">
              <span><strong>Gender:</strong> {gender}</span>
              <span>•</span>
              <span><strong>Fee Status:</strong> {feeStatus}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        {showSettings && (
          <div className="bg-[#494D5F]/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-[#D0BDF4]/40 text-white space-y-4">
            <h3 className="text-lg font-bold text-[#A0D2EB] border-b border-white/10 pb-2">
              Edit Profile Details
            </h3>

            <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block mb-1 text-[#E5EAF5] font-semibold">Edit Name</label>
                <input 
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#353846] border border-white/10 text-white focus:outline-none focus:border-[#D0BDF4]"
                />
              </div>

              <div>
                <label className="block mb-1 text-[#E5EAF5] font-semibold">Edit Status</label>
                <input 
                  type="text"
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#353846] border border-white/10 text-white focus:outline-none focus:border-[#D0BDF4]"
                />
              </div>

              <div>
                <label className="block mb-1 text-[#E5EAF5] font-semibold">Fee Status</label>
                <select
                  value={feeStatus}
                  onChange={(e) => setFeeStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#353846] border border-white/10 text-white focus:outline-none focus:border-[#D0BDF4]"
                >
                  <option value="Per Hour">Per Hour</option>
                  <option value="Per Week">Per Week</option>
                  <option value="Per Month">Per Month</option>
                  <option value="By Negotiation">By Negotiation</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[#E5EAF5] font-semibold">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#353846] border border-white/10 text-white focus:outline-none focus:border-[#D0BDF4]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[#E5EAF5] font-semibold">Privacy</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#353846] border border-white/10 text-white focus:outline-none focus:border-[#D0BDF4]"
                >
                  <option value="Public">Public Profile</option>
                  <option value="Private">Private Profile</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[#E5EAF5] font-semibold">Upload Profile Picture</label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 rounded-full bg-[#353846] border border-white/10 text-white text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#8458B3] file:text-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-1 text-[#E5EAF5] font-semibold">Phone Number</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#353846] border border-white/10 text-white focus:outline-none focus:border-[#D0BDF4]"
                />
              </div>

              <div>
                <label className="block mb-1 text-[#E5EAF5] font-semibold">Telegram Username</label>
                <input 
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#353846] border border-white/10 text-white focus:outline-none focus:border-[#D0BDF4]"
                />
              </div>

              <div className="md:col-span-2 pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#8458B3] hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold px-6 py-2.5 rounded-full transition shadow-md cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <Link
            href="/classrooms"
            className="flex items-center justify-center p-3.5 rounded-full bg-[#8458B3]/90 hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold text-xs uppercase shadow-lg backdrop-blur-md transition-all border border-white/20 text-center"
          >
            Give Free Tutor
          </Link>

          <Link
            href="/private-rooms"
            className="flex items-center justify-center p-3.5 rounded-full bg-[#8458B3]/90 hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold text-xs uppercase shadow-lg backdrop-blur-md transition-all border border-white/20 text-center"
          >
            Give Private Tutor
          </Link>

          <button
            onClick={() => alert(`Connection request sent for ${userName}!`)}
            className="flex items-center justify-center p-3.5 rounded-full bg-[#8458B3]/90 hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold text-xs uppercase shadow-lg backdrop-blur-md transition-all border border-white/20 text-center cursor-pointer"
          >
            Connect
          </button>

          <button
            onClick={() => setShowContactsModal(true)}
            className="flex items-center justify-center p-3.5 rounded-full bg-[#8458B3]/90 hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold text-xs uppercase shadow-lg backdrop-blur-md transition-all border border-white/20 text-center cursor-pointer"
          >
             My Contacts
          </button>

          <button
            onClick={() => {
              setIsVerified(true);
              alert('Account Verification request submitted!');
            }}
            className="flex items-center justify-center p-3.5 rounded-full bg-[#8458B3]/90 hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold text-xs uppercase shadow-lg backdrop-blur-md transition-all border border-white/20 text-center cursor-pointer"
          >
            {isVerified ? '✓ Verified' : 'Verify Account'}
          </button>
        </div>

      </section>

      {/* Full Photo Modal */}
      {showFullPP && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-pointer"
          onClick={() => setShowFullPP(false)}
        >
          <div className="relative max-w-xl max-h-[85vh]">
            <img 
              src={avatarUrl} 
              alt={userName} 
              className="max-w-full max-h-[80vh] rounded-3xl object-contain border-2 border-white/20 shadow-2xl"
            />
            <button 
              onClick={() => setShowFullPP(false)}
              className="absolute top-4 right-4 text-white bg-black/60 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Contacts Modal */}
      {showContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#494D5F] text-white p-6 rounded-3xl max-w-sm w-full border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xl font-bold text-[#A0D2EB]">Contact Details</h2>
              <button 
                onClick={() => setShowContactsModal(false)}
                className="text-gray-300 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-[#353846] p-3 rounded-2xl border border-white/5">
                <p className="text-xs text-[#A0D2EB] font-semibold">Email</p>
                <p className="text-white font-medium">{email}</p>
              </div>

              <div className="bg-[#353846] p-3 rounded-2xl border border-white/5">
                <p className="text-xs text-[#A0D2EB] font-semibold">Phone</p>
                <p className="text-white font-medium">{phone}</p>
              </div>

              <div className="bg-[#353846] p-3 rounded-2xl border border-white/5">
                <p className="text-xs text-[#A0D2EB] font-semibold">Telegram</p>
                <p className="text-white font-medium">{telegram}</p>
              </div>
            </div>

            <button
              onClick={() => setShowContactsModal(false)}
              className="w-full bg-[#8458B3] hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] font-bold py-2.5 rounded-full transition cursor-pointer text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#494D5F] text-white p-6 rounded-3xl max-w-md w-full border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xl font-bold text-[#A0D2EB]">Create New Post</h2>
              <button 
                onClick={() => setShowPostModal(false)}
                className="text-gray-300 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                rows={4}
                placeholder="Share your tutoring updates or announcements..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#353846] text-white border border-white/10 focus:outline-none focus:border-[#D0BDF4] text-xs resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-full bg-[#353846] text-gray-300 text-xs font-semibold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#8458B3] hover:bg-[#D0BDF4] text-white hover:text-[#494D5F] text-xs font-semibold transition shadow-md"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}