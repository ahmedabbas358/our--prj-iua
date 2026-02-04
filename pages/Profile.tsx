
import * as React from 'react';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Save, X, Edit2, BookOpen, GraduationCap, Camera, Image as ImageIcon } from 'lucide-react';
import { Card, Button, Input, Badge, Select, useToast } from '../components/ui';
import { api } from '../services/mockApi';
import { Member } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Profile: React.FC = () => {
  const [user, setUser] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Member>>({});
  const [errors, setErrors] = useState<{[key:string]: string}>({});
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const t = translations[language];
  const { addToast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getCurrentUser();
      setUser(data);
      setFormData(data);
    } catch (error) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: {[key:string]: string} = {};
    if (!formData.fullName || formData.fullName.length < 3) newErrors.fullName = "Name must be at least 3 characters";
    if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email || '')) newErrors.email = "Invalid email format";
    if (formData.phone && formData.phone.length < 10) newErrors.phone = "Phone number is too short";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validate()) return;

    try {
      const updated = await api.updateCurrentUser(user.id, formData);
      setUser(updated);
      setIsEditing(false);
      setErrors({});
      addToast('Profile updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
    }
  };

  const handleChangeCover = async () => {
      // Simulation of cover change
      if (!user) return;
      const mockCovers = [
          'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1080',
          'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1080',
          'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080'
      ];
      const randomCover = mockCovers[Math.floor(Math.random() * mockCovers.length)];
      
      const updated = await api.updateCurrentUser(user.id, { coverImage: randomCover });
      setUser(updated);
      setFormData({...formData, coverImage: randomCover});
      addToast('Cover image updated (Mock)', 'success');
  };

  if (loading || !user) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading profile...</div>;
  
  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({ 
      label: `Semester ${i + 1}`, 
      value: `Semester ${i + 1}` 
  }));

  const majorOptions = [
      { label: t.cs, value: 'CS' },
      { label: t.it, value: 'IT' },
      { label: t.is, value: 'IS' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Cover & Header */}
      <div className="relative mb-16">
          <div className="h-48 md:h-64 w-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative group">
              {user.coverImage ? (
                  <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
              )}
              
              {isEditing && (
                  <button 
                    onClick={handleChangeCover}
                    className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
                  >
                      <ImageIcon size={16} /> {t.changeCover}
                  </button>
              )}
          </div>

          <div className="absolute -bottom-12 left-6 md:left-10 flex items-end gap-4">
               <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg relative group">
                    <span className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                    </span>
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white">
                            <Camera size={24} />
                        </div>
                    )}
               </div>
               <div className="mb-2 md:mb-4">
                   <h1 className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md sm:drop-shadow-none">{user.fullName}</h1>
                   <p className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center gap-1">
                       {user.role} 
                       {user.semester && ` • ${user.semester}`}
                   </p>
               </div>
          </div>

          <div className="absolute -bottom-12 right-6 md:right-0 mb-4 hidden sm:block">
            {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                    <Edit2 size={16} className="mr-2" /> {t.editProfile}
                </Button>
            )}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Left Column: Quick Stats / Badges */}
        <div className="md:col-span-1 space-y-6">
            <Card title={t.status}>
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                        <Badge variant="success">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Major</span>
                        <Badge variant="info">{user.major || 'CS'}</Badge>
                    </div>
                    <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Committees</p>
                        <div className="flex flex-wrap gap-2">
                            {user.committees.map(c => (
                            <Badge key={c} variant="neutral">{c}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>

        {/* Right Column: Edit Form or View Details */}
        <div className="md:col-span-2">
            <Card title={language === 'ar' ? 'المعلومات الشخصية' : "Personal Information"}>
            {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Full Name" 
                        value={formData.fullName} 
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        error={errors.fullName}
                        required
                    />
                    <Input 
                        label="Student ID" 
                        value={formData.studentId} 
                        disabled
                        className="bg-slate-100 dark:bg-slate-900/50 cursor-not-allowed"
                    />
                </div>
                <Input 
                    label="Email Address" 
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    error={errors.email}
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <Input 
                        label="Phone Number" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        error={errors.phone}
                    />
                    <Select 
                        label={t.semester}
                        options={semesterOptions}
                        value={formData.semester}
                        onChange={e => setFormData({...formData, semester: e.target.value})}
                    />
                </div>
                <Select 
                        label={t.major}
                        options={majorOptions}
                        value={formData.major}
                        onChange={e => setFormData({...formData, major: e.target.value as any})}
                />
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-2 mb-1"><Shield size={14} /> <strong>Role:</strong> {user.role}</p>
                    <p className="flex items-center gap-2"><Calendar size={14} /> <strong>Joined:</strong> {user.joinDate}</p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => {
                        setFormData(user);
                        setIsEditing(false);
                        setErrors({});
                    }}>
                    <X size={16} className="mr-2" /> Cancel
                    </Button>
                    <Button type="submit">
                    <Save size={16} className="mr-2" /> Save Changes
                    </Button>
                </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Full Name</label>
                        <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                            <User size={16} className="text-slate-400" /> {user.fullName}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Student ID</label>
                        <p className="text-slate-900 dark:text-white font-medium">{user.studentId}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Email</label>
                        <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                            <Mail size={16} className="text-slate-400" /> {user.email}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Phone</label>
                        <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                            <Phone size={16} className="text-slate-400" /> {user.phone}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">{t.semester}</label>
                        <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                            <BookOpen size={16} className="text-slate-400" /> {user.semester || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">{t.major}</label>
                        <p className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                            <GraduationCap size={16} className="text-slate-400" /> {user.major || 'CS'}
                        </p>
                    </div>
                </div>
            )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
