import * as React from 'react';
import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Trash2, Mail, Download } from 'lucide-react';
import { Card, Button, Input, Badge, Modal, Select, useToast } from '../components/ui';
import { api } from '../services/mockApi';
import { Member, Role, CommitteeType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  const [userRole, setUserRole] = useState<Role>(Role.MEMBER);

  // Form State
  const [formData, setFormData] = useState<Partial<Member>>({
    fullName: '', studentId: '', email: '', phone: '', role: Role.MEMBER, committees: []
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadMembers();
    api.getCurrentUser().then(u => setUserRole(u.role));
  }, []);

  const loadMembers = async () => {
    const data = await api.getMembers();
    setMembers(data);
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.fullName || formData.fullName.length < 3) newErrors.fullName = "Name must be at least 3 chars";
    if (!formData.studentId || formData.studentId.length < 3) newErrors.studentId = "Valid Student ID required";
    if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email || '')) newErrors.email = "Invalid email format";
    if (formData.phone && formData.phone.length < 10) newErrors.phone = "Phone number too short";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const newMember: Member = {
        id: Math.random().toString(36).substr(2, 9),
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        committees: [CommitteeType.EXECUTIVE], // Default for demo
        ...(formData as Member)
      };

      await api.addMember(newMember);
      addToast('Member added successfully!', 'success');
      setIsModalOpen(false);
      setFormData({ fullName: '', studentId: '', email: '', phone: '', role: Role.MEMBER });
      setErrors({});
      loadMembers();
    } catch (e) {
      addToast('Failed to add member', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await api.deleteMember(id);
        addToast('Member removed', 'info');
        loadMembers();
      } catch (e) {
        addToast('Failed to delete member', 'error');
      }
    }
  };

  const handleExport = () => {
    const headers = ['Full Name', 'Student ID', 'Email', 'Phone', 'Role', 'Status', 'Semester', 'Major'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + members.map(m => `${m.fullName},${m.studentId},${m.email},${m.phone},${m.role},${m.status},${m.semester || ''},${m.major || ''}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "amis_members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(t.exportCSV, 'success');
  };

  const filteredMembers = members.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.studentId.includes(searchTerm) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdmin = [Role.ADMIN, Role.PRESIDENT, Role.VICE_PRESIDENT].includes(userRole);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.members}</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage association members and roles.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
                <Download size={18} className="mr-2"/> {t.exportCSV}
            </Button>
            {isAdmin && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus size={18} className="mr-2" /> {t.addMember}
              </Button>
            )}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or email..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="hidden sm:flex">
            <Filter size={18} className="mr-2" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Name & ID</th>
                <th className="px-6 py-4">{t.contact}</th>
                <th className="px-6 py-4">{t.role}</th>
                <th className="px-6 py-4">{t.semester} & {t.major}</th>
                <th className="px-6 py-4">{t.status}</th>
                {isAdmin && <th className="px-6 py-4 text-right">{t.actions}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{member.fullName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs">{member.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1"><Mail size={12} /> {member.email}</div>
                    <div className="text-xs">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={member.role === Role.PRESIDENT ? 'info' : 'neutral'}>
                      {member.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <div className="flex gap-2">
                        <span>{member.semester || '-'}</span>
                        {member.major && <Badge variant="neutral" className="text-[10px]">{member.major}</Badge>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success">Active</Badge>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(member.id)} className="text-slate-400 hover:text-red-600 p-1 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Member">
        <form onSubmit={handleAddMember}>
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
            onChange={e => setFormData({...formData, studentId: e.target.value})}
            error={errors.studentId}
            required
          />
          <div className="grid grid-cols-2 gap-4">
             <Input 
              label="Email" 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              error={errors.email}
              required
            />
             <Input 
              label="Phone" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})}
              error={errors.phone}
            />
          </div>
          <Select 
            label="Role"
            options={Object.values(Role).map(r => ({ label: r, value: r }))}
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value as Role})}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;