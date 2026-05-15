'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Bell, ThumbsUp, MessageSquare, UserPlus, ShieldCheck, MailWarning } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';

export default function EmailSettings() {
  const { user, linkEmail, getAccessToken } = usePrivy();
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [settings, setSettings] = useState({
    email_notifications_enabled: true,
    email_notif_likes: true,
    email_notif_comments: true,
    email_notif_follows: true,
    notification_email: ''
  });

  const privyEmail = user?.email?.address || '';

  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/notifications/settings?did=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          ...data.settings,
          notification_email: data.settings.notification_email || privyEmail
        }));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }, [user, privyEmail, getAccessToken]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          did: user?.id,
          settings: newSettings
        })
      });
      if (!res.ok) throw new Error('Failed to save');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      // Done
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveSettings(updated);
  };

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-12 bg-white/5 rounded-2xl w-1/3" />
      <div className="h-64 bg-white/5 rounded-3xl" />
    </div>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Email Notifications</h1>
        <p className="text-slate-500">Manage how and when you receive email alerts from TipHive.</p>
      </div>

      {/* Current Email Status */}
      <div className="bg-[#0f0f14] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Mail size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Primary Notification Email</div>
              <div className="text-xl font-bold text-white">{settings.notification_email || 'No email connected'}</div>
            </div>
          </div>

          {!settings.notification_email ? (
            <button 
              onClick={linkEmail}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              Connect Email via Privy
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified & Active
            </div>
          )}
        </div>
      </div>

      {/* Master Toggle */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${settings.email_notifications_enabled ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-500/10 text-slate-500'}`}>
            <Bell size={20} />
          </div>
          <div>
            <div className="font-bold text-white">Global Email Alerts</div>
            <div className="text-sm text-slate-500">Enable or disable all automated emails.</div>
          </div>
        </div>
        <Toggle 
          enabled={settings.email_notifications_enabled} 
          onChange={() => toggleSetting('email_notifications_enabled')} 
        />
      </div>

      {/* Category Toggles */}
      <div className={`space-y-4 transition-opacity duration-300 ${settings.email_notifications_enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="text-xs font-black uppercase tracking-widest text-slate-500 px-2">Notify me when...</div>
        
        <SettingsCard 
          icon={<ThumbsUp size={18} />} 
          label="Someone likes my post" 
          description="Get an email when your content receives some love."
          enabled={settings.email_notif_likes}
          onChange={() => toggleSetting('email_notif_likes')}
          color="text-pink-500"
        />

        <SettingsCard 
          icon={<MessageSquare size={18} />} 
          label="Someone comments" 
          description="Stay engaged with your community's feedback."
          enabled={settings.email_notif_comments}
          onChange={() => toggleSetting('email_notif_comments')}
          color="text-blue-500"
        />

        <SettingsCard 
          icon={<UserPlus size={18} />} 
          label="New followers" 
          description="Know exactly when your audience grows."
          enabled={settings.email_notif_follows}
          onChange={() => toggleSetting('email_notif_follows')}
          color="text-purple-500"
        />
      </div>

      {/* Warning if no email */}
      {!settings.notification_email && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex items-start gap-4">
          <MailWarning className="text-amber-500 shrink-0" size={20} />
          <p className="text-sm text-amber-500/80">
            You haven&apos;t connected an email yet. You won&apos;t receive any notifications until you link an email address to your account.
          </p>
        </div>
      )}
    </div>
  );
}

interface SettingsCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
  color: string;
}

function SettingsCard({ icon, label, description, enabled, onChange, color }: SettingsCardProps) {
  return (
    <div className="bg-[#0f0f14] border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <div className="font-bold text-white">{label}</div>
          <div className="text-xs text-slate-500">{description}</div>
        </div>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-orange-500' : 'bg-slate-700'}`}
    >
      <motion.div
        animate={{ x: enabled ? 26 : 4 }}
        initial={false}
        className="w-4 h-4 bg-white rounded-full absolute top-1"
      />
    </button>
  );
}
