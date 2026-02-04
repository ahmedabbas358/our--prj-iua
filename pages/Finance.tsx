import * as React from 'react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ArrowDownCircle, ArrowUpCircle, Download } from 'lucide-react';
import { Card, Button, Input, Select, Modal, useToast } from '../components/ui';
import { api } from '../services/mockApi';
import { FinanceEntry, Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Finance: React.FC = () => {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();
  const [userRole, setUserRole] = useState<Role>(Role.MEMBER);
  const { language } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState<Partial<FinanceEntry>>({
    type: 'Income', amount: 0, description: '', category: 'General'
  });
  const [errors, setErrors] = useState<{[key:string]: string}>({});

  useEffect(() => {
    loadFinance();
    api.getCurrentUser().then(u => setUserRole(u.role));
  }, []);

  const loadFinance = async () => {
    const data = await api.getFinanceEntries();
    setEntries(data);
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.amount || formData.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!formData.description || formData.description.length < 3) newErrors.description = "Description required (min 3 chars)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
        const newEntry: FinanceEntry = {
            id: Math.random().toString(36),
            date: new Date().toISOString().split('T')[0],
            enteredBy: 'Ahmed Abbas',
            ...(formData as FinanceEntry)
        };
        await api.addFinanceEntry(newEntry);
        addToast('Transaction recorded successfully', 'success');
        setIsModalOpen(false);
        setFormData({ type: 'Income', amount: 0, description: '', category: 'General' });
        setErrors({});
        loadFinance();
    } catch (e) {
        addToast('Failed to record transaction', 'error');
    }
  };

  const handleExport = () => {
    const headers = ['Date', 'Type', 'Amount', 'Description', 'Category', 'Entered By'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + entries.map(e => `${e.date},${e.type},${e.amount},${e.description},${e.category},${e.enteredBy}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "amis_finance_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(t.exportCSV, 'success');
  };

  // Prepare chart data (mock logic)
  const chartData = [
    { name: 'Jan', Income: 4000, Expense: 2400 },
    { name: 'Feb', Income: 3000, Expense: 1398 },
    { name: 'Mar', Income: 2000, Expense: 9800 }, 
    { name: 'Apr', Income: 2780, Expense: 3908 },
    { name: 'May', Income: 1890, Expense: 4800 },
    { name: 'Jun', Income: 2390, Expense: 3800 },
    { name: 'Nov', Income: 500000, Expense: 75000 },
  ];

  const totalIncome = entries.filter(e => e.type === 'Income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'Expense').reduce((a, b) => a + b.amount, 0);

  const canEdit = [Role.ADMIN, Role.PRESIDENT, Role.TREASURER].includes(userRole);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.finance}</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
                <Download size={18} className="mr-2" /> {t.exportCSV}
            </Button>
            {canEdit && (
              <Button onClick={() => setIsModalOpen(true)}>
                  <DollarSign size={18} className="mr-2" /> {t.recordFinance}
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900">
          <p className="text-emerald-600 dark:text-emerald-400 font-medium mb-1 flex items-center gap-2"><ArrowUpCircle size={16}/> Total Income</p>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">SDG {totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-100 dark:border-red-900">
          <p className="text-red-600 dark:text-red-400 font-medium mb-1 flex items-center gap-2"><ArrowDownCircle size={16}/> Total Expenses</p>
          <p className="text-3xl font-bold text-red-700 dark:text-red-300">SDG {totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
          <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">Net Balance</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">SDG {(totalIncome - totalExpense).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Overview">
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </Card>

        <Card title="Recent Transactions">
          <div className="overflow-auto max-h-64">
            <table className="w-full text-sm">
              <thead className="text-slate-500 dark:text-slate-400 font-medium sticky top-0 bg-white dark:bg-slate-800">
                <tr>
                  <th className="text-left pb-3">Description</th>
                  <th className="text-left pb-3">Date</th>
                  <th className="text-right pb-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td className="py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{entry.description}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{entry.category}</div>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{entry.date}</td>
                    <td className={`py-3 text-right font-medium ${entry.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {entry.type === 'Income' ? '+' : '-'} {entry.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Finance Entry">
        <form onSubmit={handleSubmit}>
          <Select 
            label="Type"
            options={[{label: 'Income', value: 'Income'}, {label: 'Expense', value: 'Expense'}]}
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value as any})}
          />
          <Input 
            label="Amount (SDG)" 
            type="number"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
            error={errors.amount}
            required
          />
          <Input 
            label="Description" 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            error={errors.description}
            required
          />
          <Input 
            label="Category" 
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Record Transaction</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finance;