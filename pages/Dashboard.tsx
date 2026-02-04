import * as React from 'react';
import { useEffect, useState } from 'react';
import { Users, Calendar, CheckSquare, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui';
import { api } from '../services/mockApi';
import { Stats } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    api.getStats().then(setStats);
  }, []);

  if (!stats) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title={t.totalMembers} 
          value={stats.totalMembers} 
          icon={<Users size={24} className="text-blue-600 dark:text-blue-400" />} 
          trend="+12% this month"
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatsCard 
          title={t.activeEvents} 
          value={stats.activeEvents} 
          icon={<Calendar size={24} className="text-purple-600 dark:text-purple-400" />} 
          trend="3 upcoming"
          color="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatsCard 
          title={t.pendingTasks} 
          value={stats.pendingTasks} 
          icon={<CheckSquare size={24} className="text-orange-600 dark:text-orange-400" />} 
          trend="5 due today"
          color="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatsCard 
          title={t.currentBalance} 
          value={`SDG ${stats.balance.toLocaleString()}`} 
          icon={<DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />} 
          trend="+5% vs last month"
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t.recentActivity}>
          <div className="space-y-4">
            <ActivityItem 
              icon={<Users size={18} />} 
              title="New member registered" 
              desc="Hassan Ali joined the Media Committee" 
              time="2h ago" 
            />
            <ActivityItem 
              icon={<DollarSign size={18} />} 
              title="Expense Recorded" 
              desc="SDG 25,000 for Printing Posters" 
              time="5h ago" 
            />
            <ActivityItem 
              icon={<CheckSquare size={18} />} 
              title="Task Completed" 
              desc="Design Event Poster marked as Done" 
              time="1d ago" 
            />
          </div>
        </Card>

        <Card title={t.quickActions}>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionButton 
                onClick={() => navigate('/members')} 
                icon={<Users size={20} />} 
                label={t.addMember} 
                colorClass="text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300" 
            />
            <QuickActionButton 
                onClick={() => navigate('/events')} 
                icon={<Calendar size={20} />} 
                label={t.newEvent} 
                colorClass="text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300" 
            />
            <QuickActionButton 
                onClick={() => navigate('/finance')} 
                icon={<DollarSign size={20} />} 
                label={t.recordFinance} 
                colorClass="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300" 
            />
            <QuickActionButton 
                onClick={() => navigate('/tasks')} 
                icon={<CheckSquare size={20} />} 
                label={t.createTask} 
                colorClass="text-orange-600 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300" 
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, trend, color }: any) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-full">{trend}</span>
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
  </div>
);

const ActivityItem = ({ icon, title, desc, time }: any) => (
  <div className="flex items-start gap-3 pb-3 border-b border-slate-50 dark:border-slate-700 last:border-0 last:pb-0">
    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
    <span className="text-xs text-slate-400 dark:text-slate-500">{time}</span>
  </div>
);

const QuickActionButton = ({ onClick, icon, label, colorClass }: any) => (
    <button 
        onClick={onClick}
        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex flex-col items-center gap-2 transition-all active:scale-95"
    >
        <div className={`p-2 rounded-full ${colorClass}`}>{icon}</div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </button>
);

export default Dashboard;