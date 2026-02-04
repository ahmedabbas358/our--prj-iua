import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Select } from '../components/ui';
import { api } from '../services/mockApi';
import { CheckCircle, AlertCircle, ArrowRight, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Info, 2: Email Verify, 3: Success
  const { dir, language } = useLanguage();
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    semester: 'Semester 1',
    major: 'CS'
  });
  
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState(''); // The code we "sent"
  const [errors, setErrors] = useState<{[key:string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateStep1 = () => {
    const newErrors: any = {};
    if (formData.fullName.length < 3) newErrors.fullName = "Full Name must be at least 3 characters";
    if (formData.studentId.length < 4) newErrors.studentId = "Enter a valid Student ID";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
        // 1. Verify against University DB
        const isValidStudent = await api.verifyStudent(formData.studentId, formData.fullName);
        if (!isValidStudent) {
            setErrors({ form: "Verification Failed: Student ID and Name do not match University Records." });
            setIsLoading(false);
            return;
        }

        // 2. Simulate sending email verification
        const code = await api.sendVerificationCode(formData.email);
        setSentCode(code);
        alert(`(Mock Email) Your verification code is: ${code}`); // Demo purpose
        setStep(2);
    } catch (error: any) {
        setErrors({ form: error.message || "Registration failed." });
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      if (verificationCode !== sentCode) {
          setErrors({ code: "Invalid verification code" });
          return;
      }

      setIsLoading(true);
      try {
          await api.signup({
            fullName: formData.fullName,
            studentId: formData.studentId,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            semester: formData.semester,
            major: formData.major
          });
          setStep(3); // Success
      } catch (error: any) {
          setErrors({ form: error.message });
          setStep(1); // Go back if user exists
      } finally {
          setIsLoading(false);
      }
  };

  const semesterOptions = Array.from({ length: 8 }, (_, i) => ({ 
      label: `Semester ${i + 1}`, 
      value: `Semester ${i + 1}` 
  }));

  const majorOptions = [
      { label: t.cs, value: 'CS' },
      { label: t.it, value: 'IT' },
      { label: t.is, value: 'IS' },
  ];

  if (step === 3) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4" dir={dir}>
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 text-center border border-slate-100 dark:border-slate-700">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome, {formData.fullName.split(' ')[0]}!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Your account has been verified and created successfully. You can now access the platform.</p>
                <Button onClick={() => navigate('/login')} className="w-full">Go to Login</Button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4" dir={dir}>
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-700 transition-all">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto flex items-center justify-center text-white text-xl font-bold mb-4">A</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Registration</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
              <span className={`h-2 w-2 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-green-500'}`}></span>
              <span className={`h-2 w-2 rounded-full ${step === 2 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}></span>
          </div>
        </div>

        {step === 1 ? (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
            {errors.form && (
                <div className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5" />
                    <span>{errors.form}</span>
                </div>
            )}
            
            <div className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 p-3 rounded-lg text-xs mb-4">
                <strong>Note:</strong> Your Name and Student ID must match university records exactly.
            </div>

            <Input 
                name="fullName"
                label="Full Name (As per ID Card)" 
                placeholder="e.g. Ali Ahmed"
                value={formData.fullName} 
                onChange={handleChange} 
                error={errors.fullName}
            />
            <Input 
                name="studentId"
                label="Student ID" 
                placeholder="e.g. 10234"
                value={formData.studentId} 
                onChange={handleChange} 
                error={errors.studentId}
            />
             <div className="grid grid-cols-2 gap-4">
                <Select 
                    name="major"
                    label={t.major}
                    options={majorOptions}
                    value={formData.major}
                    onChange={handleChange}
                />
                <Select 
                    name="semester"
                    label={t.semester}
                    options={semesterOptions}
                    value={formData.semester}
                    onChange={handleChange}
                />
            </div>
            <Input 
                name="phone"
                label="Phone (Optional)" 
                value={formData.phone} 
                onChange={handleChange} 
            />
            <Input 
                name="email"
                label="University/Personal Email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                error={errors.email}
            />
            <Input 
                name="password"
                label="Password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                error={errors.password}
            />
            <Input 
                name="confirmPassword"
                label="Confirm Password" 
                type="password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                error={errors.confirmPassword}
            />

            <Button type="submit" className="w-full py-3" disabled={isLoading}>
                {isLoading ? 'Verifying Records...' : 'Verify & Continue'} <ArrowRight size={16} className="ml-2 rtl:rotate-180" />
            </Button>
            </form>
        ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail size={24} />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Verify Email</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        We sent a 6-digit code to <strong>{formData.email}</strong>.
                        <br/>(Check console/alert for code in demo)
                    </p>
                </div>

                <Input 
                    name="code"
                    label="Verification Code" 
                    placeholder="123456"
                    className="text-center text-2xl tracking-widest"
                    value={verificationCode} 
                    onChange={e => setVerificationCode(e.target.value)} 
                    error={errors.code}
                    maxLength={6}
                />

                <Button type="submit" className="w-full py-3" disabled={isLoading}>
                    {isLoading ? 'Finalizing...' : 'Complete Registration'}
                </Button>
                
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                    Change Email / Details
                </button>
            </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <button onClick={() => navigate('/login')} className="text-blue-600 font-semibold hover:underline">Sign In</button>
        </div>
      </div>
    </div>
  );
};

export default Register;