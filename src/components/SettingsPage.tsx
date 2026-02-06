import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Bell, Shield, CreditCard, LogOut, Mail, Globe, Moon, Smartphone, Check, Sparkles, Loader2, Lock, ChevronRight, Receipt, Palette, Laptop, Zap, Volume2, Timer, Brain, Heart
} from 'lucide-react';

const AVATAR_STYLES = [
  { id: '3d', label: '3D Render', prompt: '3D Pixar-style character' },
  { id: 'realistic', label: 'Realistic', prompt: 'professional headshot' },
  { id: 'flat', label: 'Flat Art', prompt: 'minimalist vector art' },
  { id: 'pixel', label: 'Pixel Art', prompt: 'retro 8-bit pixel art' },
];

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentAvatar, setCurrentAvatar] = useState("https://api.dicebear.com/7.x/personas/svg?seed=DrSmith&clothing=suit&hair=shortCombover&hairColor=6c4545");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0]);
  const [profile, setProfile] = useState({ name: "Alex Thompson", email: "alex.t@med.edu", school: "Royal College of Medicine", year: "Year 4", specialty: "Cardiology", bio: "Aspiring cardiologist." });
  const [preferences, setPreferences] = useState({ visibleTimer: true, strictMode: false, autoRead: false, emailSummaries: true, pushAlerts: true, communityUpdates: false, theme: 'System Default' });
  const [sessions, setSessions] = useState([{ id: 1, device: 'MacBook Pro', current: true, location: 'London, UK', browser: 'Chrome', icon: Laptop }, { id: 2, device: 'iPhone 14', current: false, location: 'London, UK', browser: 'iOS App', icon: Smartphone }]);

  const handleSignOut = () => { setTimeout(() => navigate('/'), 1500); };
  const togglePreference = (key: keyof typeof preferences) => setPreferences(prev => ({ ...prev, [key]: !prev[key] }));

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="px-6 py-8 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          <h2 className="text-2xl font-bold text-foreground px-4 mb-6">Settings</h2>
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <tab.icon className="w-5 h-5" />{tab.label}
              </button>
            ))}
          </div>
          <div className="pt-8 mt-8 border-t border-border px-4">
            <button onClick={handleSignOut} className="flex items-center gap-3 text-red-500 font-medium hover:text-red-600 w-full"><LogOut className="w-5 h-5" />Sign Out</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow max-w-4xl">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 border border-white/40">
                <div className="relative group flex-shrink-0">
                  <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-primary to-accent shadow-xl">
                    <div className="w-full h-full rounded-full bg-white overflow-hidden relative">
                      <img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
                      {isGenerating && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>}
                    </div>
                  </div>
                  <button onClick={() => setIsGenerating(true)} disabled={isGenerating} className="absolute bottom-0 right-0 p-3 bg-white text-primary rounded-full shadow-lg border border-primary/20 hover:scale-110 transition-transform"><Sparkles className="w-5 h-5" /></button>
                </div>
                <div className="flex-grow space-y-4 text-center md:text-left">
                  <div><h3 className="text-2xl font-bold text-foreground">AI Avatar Studio</h3><p className="text-sm text-muted-foreground">Select a style and generate.</p></div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {AVATAR_STYLES.map((style) => <button key={style.id} onClick={() => setSelectedStyle(style)} className={`px-4 py-2 rounded-lg text-xs font-bold border ${selectedStyle.id === style.id ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground'}`}>{style.label}</button>)}
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 space-y-8 border border-white/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[{ label: 'Full Name', icon: User, value: profile.name, key: 'name' }, { label: 'Email', icon: Mail, value: profile.email, key: 'email' }, { label: 'Medical School', icon: Globe, value: profile.school, key: 'school' }, { label: 'Specialty', icon: Heart, value: profile.specialty, key: 'specialty' }].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase ml-1">{field.label}</label>
                      <div className="relative"><field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" value={field.value} onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-muted/20 border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 outline-none text-sm" /></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2"><label className="text-xs font-bold text-muted-foreground uppercase ml-1">Bio</label><textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full p-4 bg-muted/20 border border-border rounded-xl text-foreground text-sm min-h-[100px] resize-none" /></div>
                <div className="pt-6 border-t border-border/50 flex justify-end"><button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">Save Changes</button></div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="glass-card p-8 border border-white/40">
                <div className="flex items-center gap-3 mb-6"><div className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><Brain className="w-5 h-5" /></div><h3 className="text-xl font-bold text-foreground">Simulation Experience</h3></div>
                <div className="space-y-4">
                  {[{ key: 'visibleTimer', icon: Timer, label: 'Visible Timer', desc: 'Show countdown', color: 'bg-orange-100 text-orange-600' }, { key: 'strictMode', icon: Zap, label: 'Strict Mode', desc: 'Disable hints', color: 'bg-purple-100 text-purple-600' }, { key: 'autoRead', icon: Volume2, label: 'Auto-Read', desc: 'TTS for replies', color: 'bg-blue-100 text-blue-600' }].map((pref) => (
                    <div key={pref.key} onClick={() => togglePreference(pref.key as keyof typeof preferences)} className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 cursor-pointer">
                      <div className="flex items-center gap-4"><div className={`p-2.5 rounded-xl ${pref.color}`}><pref.icon className="w-4 h-4" /></div><div><h4 className="font-bold text-foreground text-sm">{pref.label}</h4><p className="text-xs text-muted-foreground">{pref.desc}</p></div></div>
                      <div className={`w-11 h-6 rounded-full transition-colors relative ${preferences[pref.key as keyof typeof preferences] ? 'bg-primary' : 'bg-muted'}`}><div className={`absolute top-0.5 left-[2px] bg-white rounded-full h-5 w-5 transition-transform ${preferences[pref.key as keyof typeof preferences] ? 'translate-x-full' : ''}`} /></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-8 border border-white/40">
                <div className="flex items-center gap-3 mb-6"><div className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><Palette className="w-5 h-5" /></div><h3 className="text-xl font-bold text-foreground">Appearance</h3></div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50">
                  <div className="flex items-center gap-4"><div className="p-2.5 rounded-xl bg-osce-light-blue/50 text-osce-navy/70"><Moon className="w-4 h-4" /></div><div><h4 className="font-bold text-foreground text-sm">Theme Mode</h4><p className="text-xs text-muted-foreground">Adjust display</p></div></div>
                  <select value={preferences.theme} onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })} className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer outline-none"><option>System Default</option><option>Light</option><option>Dark</option></select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="glass-card p-8 border border-white/40">
                <div className="flex items-center gap-4 mb-6"><div className="p-3 rounded-xl bg-rose-100 text-rose-600"><Shield className="w-6 h-6" /></div><div><h3 className="text-xl font-bold text-foreground">Login & Security</h3><p className="text-sm text-muted-foreground">Manage your account</p></div></div>
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-muted/20 border border-border"><div className="flex justify-between items-center mb-4"><div className="flex items-center gap-3"><Lock className="w-5 h-5 text-muted-foreground" /><span className="font-bold text-foreground text-sm">Password</span></div><button className="text-xs font-bold text-primary hover:underline">Update</button></div><div className="text-sm text-muted-foreground">Last changed 3 months ago</div></div>
                  <div className="p-5 rounded-2xl bg-muted/20 border border-border"><div className="flex justify-between items-center mb-4"><div className="flex items-center gap-3"><Smartphone className="w-5 h-5 text-muted-foreground" /><span className="font-bold text-foreground text-sm">Two-Factor Auth</span></div><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">Enabled</span></div><div className="text-sm text-muted-foreground">Phone ending **89</div></div>
                </div>
              </div>
              <div className="glass-card p-8 border border-white/40">
                <h3 className="text-lg font-bold text-foreground mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className={`flex items-center justify-between p-4 rounded-xl border ${session.current ? 'bg-card border-primary/20' : 'bg-muted/20 border-border'}`}>
                      <div className="flex items-center gap-4"><session.icon className={`w-8 h-8 ${session.current ? 'text-primary' : 'text-muted-foreground'}`} /><div><div className="font-bold text-sm text-foreground">{session.device} {session.current && <span className="text-xs font-normal text-muted-foreground ml-1">(This Device)</span>}</div><div className="text-xs text-muted-foreground">{session.location} • {session.browser}</div></div></div>
                      {session.current ? <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> : <button onClick={() => setSessions(prev => prev.filter(s => s.id !== session.id))} className="text-xs font-bold text-rose-500 hover:text-rose-600">Revoke</button>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-8 border border-red-100 bg-red-50/30"><h3 className="text-lg font-bold text-red-700 mb-2">Danger Zone</h3><p className="text-sm text-red-600/80 mb-6">Once deleted, there is no going back.</p><button onClick={() => window.confirm("Are you sure?") && navigate('/')} className="px-6 py-2.5 rounded-xl border border-red-200 bg-white text-red-600 font-bold text-sm hover:bg-red-50">Delete Account</button></div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="glass-card p-8 border border-white/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="flex justify-between items-start mb-8 relative z-10"><div><div className="text-sm font-bold text-primary uppercase mb-2">Current Plan</div><h3 className="text-3xl font-black text-foreground">Student Pro</h3><p className="text-muted-foreground mt-1">Billed annually</p></div><div className="text-right"><div className="text-3xl font-black text-foreground">$12<span className="text-lg text-muted-foreground font-medium">/mo</span></div><div className="text-xs text-muted-foreground">Next billing: Apr 15, 2024</div></div></div>
                <div className="flex gap-4 relative z-10"><button className="px-6 py-2.5 rounded-xl bg-foreground text-background font-bold text-sm">Manage Subscription</button><button className="px-6 py-2.5 rounded-xl border border-border bg-white text-foreground font-bold text-sm">View Invoices</button></div>
              </div>
              <div className="glass-card p-8 border border-white/40"><h3 className="text-xl font-bold text-foreground mb-6">Payment Method</h3><div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/50"><div className="flex items-center gap-4"><div className="w-12 h-8 bg-osce-navy rounded flex items-center justify-center text-white font-bold text-xs">VISA</div><div><div className="font-bold text-foreground text-sm">•••• 4242</div><div className="text-xs text-muted-foreground">Expires 12/25</div></div></div><button className="text-xs font-bold text-primary hover:underline">Update</button></div></div>
              <div className="glass-card p-8 border border-white/40"><h3 className="text-xl font-bold text-foreground mb-6">Invoice History</h3><div className="space-y-1">{[{ date: 'Mar 15, 2024', amount: '$144.00', status: 'Paid' }, { date: 'Mar 15, 2023', amount: '$120.00', status: 'Paid' }].map((inv, i) => (<div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 rounded-xl"><div className="flex items-center gap-4"><Receipt className="w-5 h-5 text-muted-foreground" /><span className="text-sm font-medium text-foreground">{inv.date}</span></div><div className="flex items-center gap-4"><span className="text-sm text-muted-foreground">{inv.amount}</span><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1"><Check className="w-3 h-3" /> {inv.status}</span><ChevronRight className="w-4 h-4 text-muted-foreground" /></div></div>))}</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
