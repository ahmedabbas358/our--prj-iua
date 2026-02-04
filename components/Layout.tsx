import * as React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, CheckSquare, DollarSign, LogOut, Menu, X, UserCircle, MessageCircle, GitMerge, Sun, Moon, Globe } from 'lucide-react';
import { Role } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: Role;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, dir } = useLanguage();
  const t = translations[language];

  const handleLogout = () => {
    localStorage.removeItem('amis_token');
    navigate('/');
  };

  const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
        }`
      }
      onClick={() => setIsSidebarOpen(false)}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300" dir={dir}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 ${dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'} z-50 h-screen w-64 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : (dir === 'rtl' ? 'translate-x-full' : '-translate-x-full')
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">AMIS</span>
            </div>
            <button className="lg:hidden text-slate-500 dark:text-slate-400" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label={t.dashboard} />
            <NavItem to="/community" icon={<MessageCircle size={20} />} label={t.community} />
            <NavItem to="/committees" icon={<GitMerge size={20} />} label={t.committees} />
            <NavItem to="/members" icon={<Users size={20} />} label={t.members} />
            <NavItem to="/events" icon={<Calendar size={20} />} label={t.events} />
            <NavItem to="/tasks" icon={<CheckSquare size={20} />} label={t.tasks} />
            <NavItem to="/finance" icon={<DollarSign size={20} />} label={t.finance} />
            <div className="my-4 border-t border-slate-100 dark:border-slate-800 mx-4"></div>
            <NavItem to="/profile" icon={<UserCircle size={20} />} label={t.profile} />
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
             {/* Controls */}
             <div className="flex justify-between items-center px-2">
                <button 
                  onClick={toggleTheme} 
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title={theme === 'dark' ? t.switchToLight : t.switchToDark}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button 
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                >
                  <Globe size={18} /> {language.toUpperCase()}
                </button>
             </div>

            <div 
              className="flex items-center gap-3 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors"
              onClick={() => navigate('/profile')}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">AA</div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Ahmed Abbas</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">President (Admin)</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              {t.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="p-4 lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">A</div>
            AMIS Mobile
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-400">
            <Menu size={24} />
          </button>
        </div>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;