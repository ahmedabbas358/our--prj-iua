import * as React from 'react';
import { useEffect, useState } from 'react';
import { Users, User, Shield } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { api } from '../services/mockApi';
import { CommitteeStats } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Committees: React.FC = () => {
  const [committees, setCommittees] = useState<CommitteeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const loadData = async () => {
      const data = await api.getCommitteeStats();
      setCommittees(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading Organizational Structure...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.committees}</h1>
        <p className="text-slate-500 dark:text-slate-400">Overview of association committees, leadership, and member distribution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {committees.map((committee) => (
          <div key={committee.name} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
            <div className={`p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center ${committee.name === 'Executive' ? 'bg-slate-900 text-white' : 'bg-slate-50 dark:bg-slate-700'}`}>
              <h3 className={`font-bold text-lg ${committee.name !== 'Executive' ? 'text-slate-900 dark:text-white' : ''}`}>{committee.name}</h3>
              <Badge variant={committee.name === 'Executive' ? 'info' : 'neutral'}>
                 {committee.name === 'Executive' ? 'Leadership' : 'Committee'}
              </Badge>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Shield size={20} />
                 </div>
                 <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Lead / Head</p>
                    <p className="font-medium text-slate-900 dark:text-white">{committee.leadName}</p>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <Users size={20} />
                 </div>
                 <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Members</p>
                    <p className="font-medium text-slate-900 dark:text-white">{committee.memberCount} Members</p>
                 </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
               <Button variant="outline" size="sm" className="w-full">{t.viewMembers}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Committees;