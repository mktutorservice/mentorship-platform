'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

type SettingsTab = 'profile' | 'privacy' | 'notifications' | 'languages' | 'policy' | 'features';

export default function ProfilePage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // User Profile State
  const [role, setRole] = useState<string>('STUDENT');
  const [userName, setUserName] = useState<string>('Alex Johnson');
  const [handle, setHandle] = useState<string>('alexjohnson');
  const [userStatus, setUserStatus] = useState<string>('Available for tutoring sessions');
  const [feeStatus, setFeeStatus] = useState<string>('Per Hour');
  const [gender, setGender] = useState<string>('Prefer not to say');
  const [avatarUrl, setAvatarUrl] = useState<string>('/card1.jpg');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [age, setAge] = useState<string>('21');
  const [academicInfo, setAcademicInfo] = useState<string>('B.Sc. Software Engineering');

  // Contact Info State
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // UI Controls
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showContactsModal, setShowContactsModal] = useState<boolean>(false);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [postContent, setPostContent] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Privacy & Security Settings State
  const [blockThirdPartyCookies, setBlockThirdPartyCookies] = useState<boolean>(true);
  const [trackingPrevention, setTrackingPrevention] = useState<boolean>(true);
  const [doNotTrack, setDoNotTrack] = useState<boolean>(true);
  const [profileVisibility, setProfileVisibility] = useState<string>('recently');
  const [dataSharing, setDataSharing] = useState<boolean>(false);

  // Notification & Language Settings
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('English');

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

    const handleOpenAddPost = () => setShowPostModal(true);
    const handleOpenContacts = () => setShowContactsModal(true);
    const handleToggleSettings = () => setShowSettings((prev) => !prev);

    window.addEventListener('open-add-post-modal', handleOpenAddPost);
    window.addEventListener('open-contacts-modal', handleOpenContacts);
    window.addEventListener('toggle-profile-settings', handleToggleSettings);

    return () => {
      window.removeEventListener('open-add-post-modal', handleOpenAddPost);
      window.removeEventListener('open-contacts-modal', handleOpenContacts);
      window.removeEventListener('toggle-profile-settings', handleToggleSettings);
    };
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
      alert('Profile details updated successfully!');
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

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen bg-[#0d0e15] text-white selection:bg-[#B38728] selection:text-white overflow-hidden pb-16">
      
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

      {/* MAIN CONTAINER */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Profile Card Header */}
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
            </div>
            
            <p className="text-xs sm:text-sm text-gray-400 italic max-w-xl">
              &quot;{userStatus}&quot;
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-gray-300 pt-1">
              <span><strong className="text-white">Gender:</strong> {gender}</span>
              <span className="text-white/20">•</span>
              <span><strong className="text-white">Fee Status:</strong> {feeStatus}</span>
            </div>
          </div>
        </div>

        {/* PROFILE SETTINGS PANEL */}
        {showSettings ? (
          <div className="bg-[#151622] border border-[#B38728]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* SETTINGS ICON TAB BAR */}
            <div className="flex items-center justify-around sm:justify-start sm:gap-8 border-b border-white/10 pb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`p-2 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'profile' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
                }`}
                title="Edit Profile"
              >
                <img src="/fountain-pen.png" alt="Edit Profile" className="w-6 h-6 object-contain" />
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                className={`p-2 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'privacy' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
                }`}
                title="Privacy & Security"
              >
                <img src="/unlock.png" alt="Privacy & Security" className="w-6 h-6 object-contain" />
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`p-2 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'notifications' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
                }`}
                title="Notifications"
              >
                <img src="/notification-bell.png" alt="Notifications" className="w-6 h-6 object-contain" />
              </button>

              <button
                onClick={() => setActiveTab('languages')}
                className={`p-2 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'languages' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
                }`}
                title="Languages"
              >
                <img src="/global.png" alt="Languages" className="w-6 h-6 object-contain" />
              </button>

              <button
                onClick={() => setActiveTab('policy')}
                className={`p-2 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'policy' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
                }`}
                title="Privacy Policy"
              >
                <img src="/data-security.png" alt="Privacy Policy" className="w-6 h-6 object-contain" />
              </button>

              <button
                onClick={() => setActiveTab('features')}
                className={`p-2 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'features' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
                }`}
                title="Features"
              >
                <img src="/data-security.png" alt="Features" className="w-6 h-6 object-contain" />
              </button>
            </div>

   {/* TAB CONTENT: SINGLE COLUMN EDIT PROFILE FORM */}
{activeTab === 'profile' && (
  <form onSubmit={handleSaveSettings} className="grid grid-cols-1 gap-5 text-xs animate-fadeIn max-w-2xl mx-auto">
    <div className="space-y-1">
      <label className="block text-gray-300 font-semibold">Full Name</label>
      <input 
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border-2 border-[#B38728] text-white shadow-[0_0_8px_rgba(179,135,40,0.3)] focus:outline-none focus:scale-[1.02] focus:border-[#FCF6BA] focus:shadow-[0_0_18px_rgba(179,135,40,0.65)] transition-all duration-200"
      />
    </div>

    <div className="space-y-1">
      <label className="block text-gray-300 font-semibold">User Name</label>
      <input 
        type="text"
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border-2 border-[#B38728] text-white shadow-[0_0_8px_rgba(179,135,40,0.3)] focus:outline-none focus:scale-[1.02] focus:border-[#FCF6BA] focus:shadow-[0_0_18px_rgba(179,135,40,0.65)] transition-all duration-200"
      />
    </div>

    <div className="space-y-1">
      <label className="block text-gray-300 font-semibold">Age</label>
      <input 
        type="number"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border-2 border-[#B38728] text-white shadow-[0_0_8px_rgba(179,135,40,0.3)] focus:outline-none focus:scale-[1.02] focus:border-[#FCF6BA] focus:shadow-[0_0_18px_rgba(179,135,40,0.65)] transition-all duration-200"
      />
    </div>

    <div className="space-y-1">
      <label className="block text-gray-300 font-semibold">Academic Information</label>
      <input 
        type="text"
        value={academicInfo}
        onChange={(e) => setAcademicInfo(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border-2 border-[#B38728] text-white shadow-[0_0_8px_rgba(179,135,40,0.3)] focus:outline-none focus:scale-[1.02] focus:border-[#FCF6BA] focus:shadow-[0_0_18px_rgba(179,135,40,0.65)] transition-all duration-200"
      />
    </div>

    <div className="space-y-1">
      <label className="block text-gray-300 font-semibold">Fee Structure</label>
      <select
        value={feeStatus}
        onChange={(e) => setFeeStatus(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border-2 border-[#B38728] text-white shadow-[0_0_8px_rgba(179,135,40,0.3)] focus:outline-none focus:scale-[1.02] focus:border-[#FCF6BA] focus:shadow-[0_0_18px_rgba(179,135,40,0.65)] transition-all duration-200 cursor-pointer"
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
        className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border-2 border-[#B38728] text-white shadow-[0_0_8px_rgba(179,135,40,0.3)] focus:outline-none focus:scale-[1.02] focus:border-[#FCF6BA] focus:shadow-[0_0_18px_rgba(179,135,40,0.65)] transition-all duration-200 cursor-pointer"
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Prefer not to say">Prefer not to say</option>
      </select>
    </div>

    <div className="space-y-1">
      <label className="block text-gray-300 font-semibold">Phone Contact</label>
      <input 
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl bg-[#0f0f17] border-2 border-[#B38728] text-white shadow-[0_0_8px_rgba(179,135,40,0.3)] focus:outline-none focus:scale-[1.02] focus:border-[#FCF6BA] focus:shadow-[0_0_18px_rgba(179,135,40,0.65)] transition-all duration-200"
      />
    </div>

    <div className="space-y-1">
      <label className="block text-gray-300 font-semibold">Profile Photo</label>
      <input 
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full px-4 py-2.5 rounded-2xl bg-[#0f0f17] border-2 border-[#B38728] text-gray-300 text-xs shadow-[0_0_8px_rgba(179,135,40,0.3)] file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B38728] file:text-black cursor-pointer focus:outline-none focus:scale-[1.02] focus:border-[#FCF6BA] focus:shadow-[0_0_18px_rgba(179,135,40,0.65)] transition-all duration-200"
      />
    </div>

    <div className="pt-3 flex justify-end">
      <button
        type="submit"
        disabled={saving}
        className="bg-[#B38728] hover:bg-[#c29532] text-black font-extrabold px-6 py-3 rounded-2xl transition shadow-[0_0_10px_rgba(179,135,40,0.4)] hover:shadow-[0_0_18px_rgba(179,135,40,0.8)] hover:scale-105 cursor-pointer disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </form>
)}
            {/* TAB CONTENT: PRIVACY & SECURITY */}
            {activeTab === 'privacy' && (
              <div className="space-y-4 text-xs animate-fadeIn max-w-2xl mx-auto">
                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Cookies</span>
                    <input 
                      type="checkbox" 
                      checked={blockThirdPartyCookies} 
                      onChange={(e) => setBlockThirdPartyCookies(e.target.checked)}
                      className="accent-[#B38728] w-4 h-4 cursor-pointer" 
                    />
                  </div>
                  <p className="text-gray-400 text-[11px]">Blocking third-party cookies or clearing them automatically when you close the browser.</p>
                </div>

                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Tracking Prevention</span>
                    <input 
                      type="checkbox" 
                      checked={trackingPrevention} 
                      onChange={(e) => setTrackingPrevention(e.target.checked)}
                      className="accent-[#B38728] w-4 h-4 cursor-pointer" 
                    />
                  </div>
                  <p className="text-gray-400 text-[11px]">Stopping trackers from following your activity across different sites.</p>
                </div>

                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Browsing Data</span>
                    <button 
                      onClick={() => alert('Browsing cache and local history cleared!')}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer"
                    >
                      Clear Cache & History
                    </button>
                  </div>
                  <p className="text-gray-400 text-[11px]">Deleting your cache, stored passwords, and local session history.</p>
                </div>

                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Do Not Track</span>
                    <input 
                      type="checkbox" 
                      checked={doNotTrack} 
                      onChange={(e) => setDoNotTrack(e.target.checked)}
                      className="accent-[#B38728] w-4 h-4 cursor-pointer" 
                    />
                  </div>
                  <p className="text-gray-400 text-[11px]">Sending a request to websites asking them not to collect your browsing data.</p>
                </div>

                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-2">
                  <span className="font-bold text-white block">Profile Visibility</span>
                  <p className="text-gray-400 text-[11px]">Choosing who sees your posts, personal info, or activity status.</p>
                  <select 
                    value={profileVisibility} 
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="w-full mt-2 px-3 py-2.5 rounded-xl bg-[#151622] border border-white/10 text-white focus:outline-none focus:border-[#B38728]"
                  >
                    <option value="recently">Last seen recently</option>
                    <option value="exact">Last seen at exact time</option>
                    <option value="hidden">Hidden (do not want you to know visibility)</option>
                  </select>
                </div>

                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Data Sharing</span>
                    <input 
                      type="checkbox" 
                      checked={dataSharing} 
                      onChange={(e) => setDataSharing(e.target.checked)}
                      className="accent-[#B38728] w-4 h-4 cursor-pointer" 
                    />
                  </div>
                  <p className="text-gray-400 text-[11px]">Controlling ad personalization and third-party app connections.</p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 text-xs animate-fadeIn max-w-2xl mx-auto">
                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Email Notifications</span>
                    <span className="text-gray-400 text-[11px]">Receive mentorship updates and class alerts via email</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailNotifications} 
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="accent-[#B38728] w-4 h-4 cursor-pointer" 
                  />
                </div>

                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Push Notifications</span>
                    <span className="text-gray-400 text-[11px]">Get instant desktop alerts for direct messages</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={pushNotifications} 
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="accent-[#B38728] w-4 h-4 cursor-pointer" 
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: LANGUAGES */}
            {activeTab === 'languages' && (
              <div className="space-y-4 text-xs animate-fadeIn max-w-2xl mx-auto">
                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-2">
                  <span className="font-bold text-white block">Display Language</span>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#151622] border border-white/10 text-white focus:outline-none focus:border-[#B38728]"
                  >
                    <option value="English">English</option>
                    <option value="Amharic">Amharic (አማርኛ)</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PRIVACY POLICY */}
            {activeTab === 'policy' && (
              <div className="bg-[#0f0f17] p-5 rounded-2xl border border-white/5 text-xs space-y-3 leading-relaxed text-gray-300 animate-fadeIn max-w-2xl mx-auto">
                <h4 className="text-white font-bold text-sm">Privacy Policy</h4>
                <p>Welcome to UNKNOWN MENTORSHIP. We are committed to safeguarding your personal information and protecting your privacy rights.</p>
                <p><strong>1. Data Collection:</strong> We collect essential information such as your name, academic credentials, and contact details to facilitate peer-to-peer tutoring.</p>
                <p><strong>2. Data Use:</strong> Your information is strictly used for classroom matching, profile verification, and session coordination.</p>
                <p><strong>3. Control:</strong> You maintain full control over your profile visibility, cookie preferences, and data sharing connections through this panel.</p>
              </div>
            )}

            {/* TAB CONTENT: FEATURES */}
            {activeTab === 'features' && (
              <div className="grid grid-cols-1 gap-4 text-xs animate-fadeIn max-w-2xl mx-auto">
                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-1">
                  <span className="font-bold text-[#FCF6BA]">Live Classrooms</span>
                  <p className="text-gray-400 text-[11px]">Interactive video sessions with automated playback controls.</p>
                </div>
                <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-1">
                  <span className="font-bold text-[#FCF6BA]">Peer Mentorship</span>
                  <p className="text-gray-400 text-[11px]">Direct 1-on-1 messaging and flexible fee structures.</p>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* REGULAR PROFILE VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            
            {/* CLASSROOMS VIDEO CARD */}
            <Link href="/classrooms" className="group block">
              <div className="bg-[#151622] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-between hover:border-[#B38728]/50 transition duration-300 shadow-2xl">
                <div className="relative w-full h-60 rounded-2xl overflow-hidden bg-black border border-white/5 shadow-inner">
                  <video 
                    autoPlay 
                    muted 
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      e.currentTarget.currentTime = 3;
                    }}
                    onEnded={(e) => {
                      e.currentTarget.currentTime = 3;
                      e.currentTarget.play();
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out pointer-events-none"
                  >
                    <source src="/class.mp4" type="video/mp4" />
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
                    preload="auto"
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
        )}

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