import * as React from 'react';
import { useEffect, useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import { Button, Input, Select, Modal } from '../components/ui';
import { api } from '../services/mockApi';
import { Task, Member, Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<Role>(Role.MEMBER);
  
  const { language } = useLanguage();
  const t = translations[language];

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '', status: 'New', priority: 'Medium', dueDate: '', assignedTo: []
  });
  const [errors, setErrors] = useState<{[key:string]: string}>({});

  useEffect(() => {
    loadTasks();
    loadMembers();
    api.getCurrentUser().then(u => setUserRole(u.role));
  }, []);

  const loadTasks = async () => {
    const data = await api.getTasks();
    setTasks(data);
  };

  const loadMembers = async () => {
    const data = await api.getMembers();
    setMembers(data);
  }

  const validate = () => {
    const newErrors: any = {};
    if (!newTask.title || newTask.title.length < 3) newErrors.title = "Title must be > 3 chars";
    
    // Date validation
    if (!newTask.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else if (new Date(newTask.dueDate) < new Date(new Date().setHours(0,0,0,0))) {
      newErrors.dueDate = "Date cannot be in the past";
    }

    if (!newTask.assignedTo || newTask.assignedTo.length === 0) newErrors.assignedTo = "Assign at least one member";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await api.addTask({
      id: Math.random().toString(),
      title: newTask.title!,
      status: newTask.status as any,
      priority: newTask.priority as any,
      dueDate: newTask.dueDate!,
      assignedTo: newTask.assignedTo!
    });
    
    setNewTask({ title: '', status: 'New', priority: 'Medium', dueDate: '', assignedTo: [] });
    setErrors({});
    setIsModalOpen(false);
    loadTasks();
  };

  const toggleAssignee = (memberId: string) => {
    const current = newTask.assignedTo || [];
    if (current.includes(memberId)) {
      setNewTask({ ...newTask, assignedTo: current.filter(id => id !== memberId) });
    } else {
      setNewTask({ ...newTask, assignedTo: [...current, memberId] });
    }
  };

  const updateStatus = async (id: string, newStatus: Task['status']) => {
    await api.updateTaskStatus(id, newStatus);
    loadTasks();
  };

  const canEdit = [Role.ADMIN, Role.PRESIDENT, Role.VICE_PRESIDENT, Role.COMMITTEE_LEAD].includes(userRole);

  const Column = ({ title, status, color }: { title: string, status: string, color: string }) => (
    <div className="flex-1 min-w-[300px] bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
      <div className={`pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center`}>
        <span className="font-semibold text-slate-700 dark:text-slate-300">{title}</span>
        <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400 shadow-sm">
          {tasks.filter(t => t.status === status).length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.filter(t => t.status === status).map(task => (
          <div key={task.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${task.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                {task.priority}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {task.dueDate}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-white mb-3">{task.title}</p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {task.assignedTo?.map(userId => {
                const m = members.find(mem => mem.id === userId);
                return m ? (
                  <span key={userId} className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 truncate max-w-[80px]">
                    {m.fullName.split(' ')[0]}
                  </span>
                ) : null;
              })}
            </div>

            {/* Quick Actions */}
            {canEdit && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {status !== 'New' && (
                  <button onClick={() => updateStatus(task.id, 'New')} className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-2 py-1 rounded dark:text-slate-300">← New</button>
                )}
                {status !== 'In Progress' && (
                  <button onClick={() => updateStatus(task.id, 'In Progress')} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2 py-1 rounded">In Prog</button>
                )}
                {status !== 'Done' && (
                  <button onClick={() => updateStatus(task.id, 'Done')} className="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-1 rounded">Done →</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.tasks}</h1>
        {canEdit && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={18} className="mr-2" /> {t.createTask}
          </Button>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        <Column title="To Do" status="New" color="slate" />
        <Column title="In Progress" status="In Progress" color="blue" />
        <Column title="Completed" status="Done" color="emerald" />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Task">
        <form onSubmit={handleCreate}>
          <Input 
            label="Task Title" 
            value={newTask.title} 
            onChange={e => setNewTask({...newTask, title: e.target.value})} 
            error={errors.title}
            required 
            placeholder="e.g. Organize Hall Booking"
          />
          <div className="grid grid-cols-2 gap-4">
             <Select
               label="Priority"
               options={[{label: 'Low', value: 'Low'}, {label: 'Medium', value: 'Medium'}, {label: 'High', value: 'High'}]}
               value={newTask.priority}
               onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
             />
             <Input 
                label="Due Date"
                type="date"
                value={newTask.dueDate}
                onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                error={errors.dueDate}
             />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assign To <span className="text-red-500">*</span></label>
            {errors.assignedTo && <p className="text-sm text-red-600 mb-2">{errors.assignedTo}</p>}
            
            <div className={`max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1 ${errors.assignedTo ? 'border-red-300 dark:border-red-700' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900`}>
              {members.length === 0 ? <p className="text-xs text-slate-400">No members found</p> : 
               members.map(member => (
                <label key={member.id} className="flex items-center gap-2 text-sm p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer text-slate-700 dark:text-slate-300">
                  <input 
                    type="checkbox" 
                    checked={newTask.assignedTo?.includes(member.id)}
                    onChange={() => toggleAssignee(member.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{member.fullName}</span>
                  <span className="text-xs text-slate-400">({member.role})</span>
                </label>
              ))}
            </div>
          </div>

           <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;