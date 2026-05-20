import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import { 
    Wrench, 
    Mail, 
    Lock, 
    Loader2, 
    AlertCircle,
    ArrowRight
} from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('admin@gotam.id');
    const [password, setPassword] = useState('password');
    const dispatch = useDispatch();
    const { loading, error, token } = useSelector((state) => state.auth);

    if (token) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo & Brand */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-secondary-container mb-4 shadow-xl shadow-primary/20">
                        <Wrench size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-primary tracking-tight">GoTam</h1>
                    <p className="text-on-surface-variant font-bold text-[14px] uppercase tracking-widest mt-1">Admin Portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-outline-variant/20">
                    <div className="mb-8">
                        <h2 className="text-[24px] font-bold text-primary">Welcome Back</h2>
                        <p className="text-on-surface-variant font-medium text-[14px]">Enter your credentials to access the console.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-start gap-3 border border-error/20 animate-in slide-in-from-top-2">
                                <AlertCircle size={20} className="shrink-0" />
                                <p className="text-[13px] font-bold leading-tight">{error.message || 'Invalid email or password'}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[12px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline group-focus-within:text-primary transition-colors">
                                    <Mail size={18} />
                                </span>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all" 
                                    placeholder="name@gotam.id"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[12px] font-black text-on-surface-variant uppercase tracking-widest">Password</label>
                                <button type="button" className="text-[12px] font-bold text-primary hover:underline">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline group-focus-within:text-primary transition-colors">
                                    <Lock size={18} />
                                </span>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] placeholder:text-outline focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all" 
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary text-on-primary py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[16px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-on-surface-variant text-[13px] font-medium">
                    Secured by GoTam Infrastructure. <br/>
                    Confidential and Proprietary.
                </p>
            </div>
        </div>
    );
};

export default Login;
