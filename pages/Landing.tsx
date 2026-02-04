import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight, BookOpen, Globe } from 'lucide-react';
import { Button, Badge } from '../components/ui';
import { api } from '../services/mockApi';
import { Event } from '../types';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = React.useState<Event[]>([]);

  React.useEffect(() => {
    // Fetch generic events for public view
    api.getEvents().then(events => {
      setUpcomingEvents(events.slice(0, 3));
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* Small Logo for Navbar */}
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
               <span className="text-xs">IUA</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AMIS</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm">
              Log In
            </button>
            <Button onClick={() => navigate('/register')} size="sm">
              Join Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-white dark:bg-slate-900 relative overflow-hidden transition-colors">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 opacity-50 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center relative z-10">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="w-40 h-40 bg-white dark:bg-slate-800 rounded-full shadow-xl flex items-center justify-center border-4 border-slate-100 dark:border-slate-700 p-2">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                    <Globe size={64} className="text-white opacity-20 absolute" />
                    <div className="text-white text-center font-bold">
                        <div className="text-xs opacity-80">COMPUTER</div>
                        <div className="text-2xl tracking-widest">ASSN</div>
                        <div className="text-xs opacity-80">IUA</div>
                    </div>
                </div>
            </div>
          </div>

          <Badge variant="info" className="mb-6">Computer Association - International University of Africa</Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
            Empowering Future <span className="text-blue-600 dark:text-blue-400">Tech Leaders</span>
          </h1>
          
          {/* Arabic Description */}
          <div className="max-w-3xl mx-auto mb-4 bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
            <p className="text-xl sm:text-2xl text-slate-800 dark:text-slate-100 font-semibold leading-relaxed" dir="rtl">
              جمعية طلابية متخصصة في مجال الحاسب الآلي تم إنشائها في 2010 بواسطة طلاب من كلية دراسات الحاسوب بجامعة أفريقيا العالمية.
            </p>
          </div>

          {/* English Subtitle */}
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 italic">
            "A student association specialized in the field of Computer Science, established in 2010 by students from the Faculty of Computer Studies at the International University of Africa."
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" onClick={() => navigate('/register')}>Become a Member <ArrowRight size={18} className="ml-2" /></Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('events')?.scrollIntoView({behavior: 'smooth'})}>View Activities</Button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Join Us?</h2>
             <p className="text-slate-500 dark:text-slate-400 mt-2">Discover the benefits of being part of the IUA Computer Community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Calendar className="text-blue-600 dark:text-blue-400" size={24} />}
              title="Events & Workshops"
              desc="Stay updated with the latest seminars, coding bootcamps, and social gatherings happening on campus."
            />
            <FeatureCard 
              icon={<Users className="text-purple-600 dark:text-purple-400" size={24} />}
              title="Community & Networking"
              desc="Connect with peers, alumni, and faculty members. Join committees and lead initiatives."
            />
            <FeatureCard 
              icon={<BookOpen className="text-emerald-600 dark:text-emerald-400" size={24} />}
              title="Academic Resources"
              desc="Access study groups, academic support, and project collaboration tools managed by the association."
            />
          </div>
        </div>
      </section>

      {/* Upcoming Activities Preview */}
      <section id="events" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Upcoming Activities</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Check out what's happening this week.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/login')}>View All</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
              <div key={event.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-colors group">
                 <div className="flex justify-between items-start mb-4">
                     <div className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </div>
                     <Badge variant="success">Upcoming</Badge>
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.title}</h3>
                 <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                 <div className="flex items-center text-sm text-slate-500 dark:text-slate-500">
                   <Globe size={14} className="mr-1" /> {event.location}
                 </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-10 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No public events listed currently.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-400 py-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">IUA</div>
               <span className="text-lg font-bold text-white">AMIS</span>
            </div>
            <p className="text-sm leading-relaxed">
              Association Management Information System.<br/>
              Faculty of Computer Science,<br/>
              International University of Africa.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Student Login</button></li>
              <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">New Registration</button></li>
              <li><span className="opacity-50 cursor-not-allowed">About Faculty</span></li>
            </ul>
          </div>
          <div>
             <h4 className="text-white font-semibold mb-4">Contact</h4>
             <p className="text-sm mb-1">info@amis.local</p>
             <p className="text-sm">Khartoum, Sudan</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          © 2025 AMIS Project. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Landing;