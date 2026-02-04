import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/ui';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@amis.local');
  const [password, setPassword] = useState('Admin@123');
  const [errors, setErrors] = useState<{email?: string; password?: string; form?: string}>({});
  const [loading, setLoading] = useState(false);
  const { dir } = useLanguage();

  const validate = () => {
    const newErrors: any = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) newErrors.email = "Invalid email format";
    
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 chars";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (validate()) {
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            if (email === 'fail@test.com') {
                setErrors({form: 'Invalid credentials provided.'});
                setLoading(false);
                return;
            }
            localStorage.setItem('amis_token', 'mock_jwt_token');
            setLoading(false);
            navigate('/dashboard');
        }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors" dir={dir}>
      <div className="w-full max-w-md mb-4">
        <button onClick={() => navigate('/')} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors">
            <ArrowLeft size={16} className="mr-2 rtl:rotate-180" /> Back to Home
        </button>
      </div>
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4">
            A
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400">Sign in to the AMIS Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            error={errors.email}
          />
          <Input 
            label="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            error={errors.password}
          />
          
          {errors.form && <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">{errors.form}</div>}

          <Button type="submit" className="w-full py-3" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account? <button onClick={() => navigate('/register')} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Register Now</button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>Demo Admin: admin@amis.local / Admin@123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;