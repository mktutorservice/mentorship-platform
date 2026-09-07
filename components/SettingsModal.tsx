'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type SettingsTab = 'profile' | 'privacy' | 'notifications' | 'languages' | 'policy' | 'features';

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form States
  const [userName, setUserName] = useState<string>('Alex Johnson');
  const [handle, setHandle] = useState<string>('alexjohnson');
  const [userStatus, setUserStatus] = useState<string>('Available for tutoring sessions');
  const [feeStatus, setFeeStatus] = useState<string>('Per Hour');
  const [gender, setGender] = useState<string>('Prefer not to say');
  const [avatarUrl, setAvatarUrl] = useState<string>('/card1.jpg');
  const [age, setAge] = useState<string>('21');
  const [academicInfo, setAcademicInfo] = useState<string>('B.Sc. Software Engineering');
  const [phone, setPhone] = useState<string>('');

  // Preference States
  const [blockThirdPartyCookies, setBlockThirdPartyCookies] = useState<boolean>(true);
  const [trackingPrevention, setTrackingPrevention] = useState<boolean>(true);
  const [doNotTrack, setDoNotTrack] = useState<boolean>(true);
  const [profileVisibility, setProfileVisibility] = useState<string>('recently');
  const [dataSharing, setDataSharing] = useState<boolean>(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('English');

  useEffect(() => {
    async function fetchUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const currentUid = session.user.id;
      setUserId(currentUid);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUid)
        .maybeSingle();

      if (profile) {
        if (profile.name) setUserName(profile.name);
        if (profile.activity_status) setUserStatus(profile.activity_status);
        if (profile.fee_status) setFeeStatus(profile.fee_status);
        if (profile.gender) setGender(profile.gender);
        if (profile.profile_picture) setAvatarUrl(profile.profile_picture);
        if (profile.phone) setPhone(profile.phone);
      }
    }

    fetchUserData();

    const handleToggleSettings = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-profile-settings', handleToggleSettings);

    return () => {
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
      setIsOpen(false);
      alert('Settings updated successfully!');
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#151622] border border-[#B38728]/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_30px_rgba(179,135,40,0.2)] space-y-6 text-white relative">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold text-[#FCF6BA]">System & Profile Settings</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white font-bold p-1 cursor-pointer transition"
          >
            ✕
          </button>
        </div>

        {/* SETTINGS TAB BAR */}
        <div className="flex items-center justify-around sm:justify-start sm:gap-6 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
            }`}
            title="Edit Profile"
          >
            <img src="/fountain-pen.png" alt="Profile" className="w-6 h-6 object-contain" />
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`p-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'privacy' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
            }`}
            title="Privacy & Security"
          >
            <img src="/unlock.png" alt="Privacy" className="w-6 h-6 object-contain" />
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`p-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'notifications' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
            }`}
            title="Notifications"
          >
            <img src="/notification-bell.png" alt="Notifications" className="w-6 h-6 object-contain" />
          </button>

          <button
            onClick={() => setActiveTab('languages')}
            className={`p-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'languages' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
            }`}
            title="Languages"
          >
            <img src="/global.png" alt="Languages" className="w-6 h-6 object-contain" />
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            className={`p-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'policy' ? 'bg-[#B38728]/20 border border-[#B38728]' : 'hover:bg-white/5 border border-transparent'
            }`}
            title="Privacy Policy"
          >
            <img src="/data-security.png" alt="Policy" className="w-6 h-6 object-contain" />
          </button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 gap-4 text-xs">
            <div className="space-y-1">
              <label className="block text-gray-300 font-semibold">Full Name</label>
              <input 
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#0f0f17] border border-[#B38728]/60 text-white focus:outline-none focus:border-[#FCF6BA]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-gray-300 font-semibold">User Name</label>
              <input 
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#0f0f17] border border-[#B38728]/60 text-white focus:outline-none focus:border-[#FCF6BA]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-gray-300 font-semibold">Academic Information</label>
              <input 
                type="text"
                value={academicInfo}
                onChange={(e) => setAcademicInfo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#0f0f17] border border-[#B38728]/60 text-white focus:outline-none focus:border-[#FCF6BA]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-gray-300 font-semibold">Fee Structure</label>
              <select
                value={feeStatus}
                onChange={(e) => setFeeStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#0f0f17] border border-[#B38728]/60 text-white focus:outline-none"
              >
                <option value="Per Hour">Per Hour</option>
                <option value="Per Week">Per Week</option>
                <option value="Per Month">Per Month</option>
                <option value="By Negotiation">By Negotiation</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-gray-300 font-semibold">Phone Contact</label>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#0f0f17] border border-[#B38728]/60 text-white focus:outline-none focus:border-[#FCF6BA]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-gray-300 font-semibold">Profile Photo</label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-2 rounded-2xl bg-[#0f0f17] border border-[#B38728]/60 text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-[#B38728] file:text-black cursor-pointer"
              />
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-2xl bg-white/5 text-gray-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#B38728] text-black font-bold px-6 py-2.5 rounded-2xl hover:bg-[#c29532]"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* PRIVACY TAB */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Cookies</span>
                <span className="text-gray-400 text-[11px]">Block third-party cookies</span>
              </div>
              <input 
                type="checkbox" 
                checked={blockThirdPartyCookies} 
                onChange={(e) => setBlockThirdPartyCookies(e.target.checked)}
                className="accent-[#B38728] w-4 h-4 cursor-pointer" 
              />
            </div>

            <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Tracking Prevention</span>
                <span className="text-gray-400 text-[11px]">Stop cross-site trackers</span>
              </div>
              <input 
                type="checkbox" 
                checked={trackingPrevention} 
                onChange={(e) => setTrackingPrevention(e.target.checked)}
                className="accent-[#B38728] w-4 h-4 cursor-pointer" 
              />
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Email Notifications</span>
                <span className="text-gray-400 text-[11px]">Receive updates via email</span>
              </div>
              <input 
                type="checkbox" 
                checked={emailNotifications} 
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="accent-[#B38728] w-4 h-4 cursor-pointer" 
              />
            </div>
          </div>
        )}

        {/* LANGUAGES TAB */}
        {activeTab === 'languages' && (
          <div className="space-y-4 text-xs">
            <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 space-y-2">
              <span className="font-bold text-white block">Display Language</span>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#151622] border border-white/10 text-white"
              >
                <option value="English">English</option>
                <option value="Amharic">Amharic (አማርኛ)</option>
              </select>
            </div>
          </div>
        )}

        {/* POLICY TAB */}
        {activeTab === 'policy' && (
          <div className="bg-[#0f0f17] p-4 rounded-2xl border border-white/5 text-xs space-y-2 text-gray-300">
            <h4 className="text-white font-bold">Privacy Policy</h4>
            <p>Your data is collected to optimize matching, profile verification, and platform security.</p>
          </div>
        )}

      </div>
    </div>
  );
}