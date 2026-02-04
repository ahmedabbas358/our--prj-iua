import * as React from 'react';
import { useEffect, useState } from 'react';
import { Calendar as CalIcon, MapPin, Users, Check, X as XIcon, Clock } from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../components/ui';
import { api } from '../services/mockApi';
import { Event, Member, Attendance, AttendanceStatus, Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [userRole, setUserRole] = useState<Role>(Role.MEMBER);
  
  const { language } = useLanguage();
  const t = translations[language];

  // Attendance State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);

  // Create Event State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '', date: '', location: '', description: '', attendees: 0
  });
  const [createErrors, setCreateErrors] = useState<{[key:string]: string}>({});

  useEffect(() => {
    loadEvents();
    loadMembers();
    api.getCurrentUser().then(u => setUserRole(u.role));
  }, []);

  const loadEvents = () => {
    api.getEvents().then(setEvents);
  };

  const loadMembers = () => {
    api.getMembers().then(setMembers);
  };

  // --- Create Event Logic ---
  const validateCreate = () => {
    const errors: any = {};
    if (!newEvent.title || newEvent.title.length < 5) errors.title = "Title must be at least 5 chars";
    if (!newEvent.location || newEvent.location.length < 3) errors.location = "Location required (min 3 chars)";
    
    if (!newEvent.date) {
        errors.date = "Date is required";
    } else {
        const selected = new Date(newEvent.date);
        const today = new Date();
        today.setHours(0,0,0,0);
        if (selected < today) errors.date = "Event date cannot be in the past";
    }
    
    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreate()) return;

    await api.addEvent({
        id: Math.random().toString(36).substr(2, 9),
        title: newEvent.title!,
        date: newEvent.date!,
        location: newEvent.location!,
        description: newEvent.description || '',
        attendees: 0
    });

    setIsCreateModalOpen(false);
    setNewEvent({ title: '', date: '', location: '', description: '', attendees: 0 });
    setCreateErrors({});
    loadEvents();
  };

  // --- Attendance Logic ---

  const openAttendanceModal = async (event: Event) => {
    setSelectedEvent(event);
    setLoading(true);
    setIsAttendanceModalOpen(true);
    
    // Reset local state
    const initialStatus: Record<string, AttendanceStatus> = {};
    
    // Fetch existing attendance
    try {
      const records = await api.getEventAttendance(event.id);
      records.forEach(r => {
        initialStatus[r.memberId] = r.status;
      });
      setAttendanceData(initialStatus);
    } catch (e) {
      console.error("Failed to load attendance", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (memberId: string) => {
    if (!selectedEvent) return;
    
    const current = attendanceData[memberId];
    let next: AttendanceStatus = 'Present';
    if (current === 'Present') next = 'Absent';
    else if (current === 'Absent') next = 'Excused';
    else if (current === 'Excused') next = 'Present';
    else next = 'Present'; // Default from undefined

    // Optimistic update
    setAttendanceData(prev => ({ ...prev, [memberId]: next }));
    
    // API Call
    await api.markAttendance(selectedEvent.id, memberId, next);
    
    // Reload events to update counts
    loadEvents();
  };

  const getStatusBadge = (status?: AttendanceStatus) => {
    switch (status) {
      case 'Present': return <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium flex items-center gap-1"><Check size={12}/> Present</span>;
      case 'Absent': return <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full font-medium flex items-center gap-1"><XIcon size={12}/> Absent</span>;
      case 'Excused': return <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full font-medium flex items-center gap-1"><Clock size={12}/> Excused</span>;
      default: return <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-1 rounded-full font-medium">Not Marked</span>;
    }
  };

  const isLead = [Role.ADMIN, Role.PRESIDENT, Role.VICE_PRESIDENT, Role.COMMITTEE_LEAD].includes(userRole);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.events}</h1>
        {isLead && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
              <CalIcon size={18} className="mr-2"/> {t.newEvent}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <Card key={event.id} className="hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-center min-w-[60px]">
                <div className="text-xs font-semibold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                <div className="text-xl font-bold">{new Date(event.date).getDate()}</div>
              </div>
              <Badge variant="success">Upcoming</Badge>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{event.title}</h3>
            
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                {event.location}
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                {event.attendees} Confirmed
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 mt-2">
                {event.description}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 mt-auto">
               <Button variant="outline" size="sm" className="w-full">Details</Button>
               {isLead && (
                 <Button 
                   variant="primary" 
                   size="sm" 
                   className="w-full"
                   onClick={() => openAttendanceModal(event)}
                 >
                   Attendance
                 </Button>
               )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create Event Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Event">
        <form onSubmit={handleCreateEvent}>
            <Input 
                label="Event Title" 
                value={newEvent.title} 
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                error={createErrors.title}
                required
                placeholder="e.g. Annual Tech Summit"
            />
            <Input 
                label="Date & Time" 
                type="datetime-local"
                value={newEvent.date} 
                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                error={createErrors.date}
                required
            />
            <Input 
                label="Location" 
                value={newEvent.location} 
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                error={createErrors.location}
                required
                placeholder="e.g. Main Hall"
            />
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    rows={3}
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                />
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit">Publish Event</Button>
            </div>
        </form>
      </Modal>

      {/* Attendance Modal */}
      <Modal 
        isOpen={isAttendanceModalOpen} 
        onClose={() => setIsAttendanceModalOpen(false)} 
        title={`Attendance: ${selectedEvent?.title}`}
      >
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
               <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Members: {members.length}</span>
               <span className="text-sm font-medium text-green-600 dark:text-green-400">Present: {Object.values(attendanceData).filter(s => s === 'Present').length}</span>
            </div>

            <div className="max-h-[60vh] overflow-y-auto border rounded-lg border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                    <div className="p-8 text-center text-slate-400">Loading members...</div>
                ) : members.map(member => (
                    <div key={member.id} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{member.fullName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{member.studentId} • {member.role}</p>
                        </div>
                        <button 
                            onClick={() => toggleStatus(member.id)}
                            className="hover:opacity-80 transition-opacity focus:outline-none"
                        >
                            {getStatusBadge(attendanceData[member.id])}
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setIsAttendanceModalOpen(false)}>Close</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Events;