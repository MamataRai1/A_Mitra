import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';

const LoginPage = () => {
    const navigate = useNavigate();
    
    // UI State
    const [theme, setTheme] = useState('dark');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const isDark = theme === 'dark';

   const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await API.post('/auth/login/', { username, password });

        // 1. Save data
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('role', response.data.user.role);
        localStorage.setItem('username', response.data.user.username);
        if (response.data.user.profile_id) {
            localStorage.setItem('profile_id', response.data.user.profile_id);
        }

        // 2. Force Redirect (refresh app with new auth state)
        if (response.data.user.role === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/dashboard';
        }

    } catch (error) {
        setErrorMsg("Invalid credentials");
    } finally {
        setLoading(false);
    }
};
    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 ${isDark ? 'bg-[#1a1625]' : 'bg-gray-100'}`}>
            
            {/* Theme Toggle */}
            <button 
                onClick={() => setTheme(isDark ? 'light' : 'dark')} 
                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl z-50 transition-transform active:scale-95"
            >
                {isDark ? '☀️' : '🌙'}
            </button>

            <div className={`flex w-full max-w-5xl ${isDark ? 'bg-[#2d2739]' : 'bg-white'} rounded-[40px] shadow-2xl overflow-hidden min-h-[600px] relative`}>
                
                {/* Left Side: Visuals */}
                <div className="hidden md:block w-1/2 relative">
                    <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000" 
                        className="absolute inset-0 w-full h-full object-cover" 
                        alt="Friends sitting together" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-bl from-indigo-900/30 via-transparent to-transparent backdrop-contrast-110"></div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                    <h2 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h2>
                    <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Please enter your details to sign in.</p>
                    
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-2xl text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Username</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="Your username"
                                className={`w-full p-4 rounded-2xl outline-none transition-all ${isDark ? 'bg-[#3d354e] text-white focus:ring-2 ring-indigo-500/50' : 'bg-gray-50 border focus:border-indigo-500'}`}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Password</label>
                            <input 
                                type="password" 
                                required 
                                placeholder="••••••••"
                                className={`w-full p-4 rounded-2xl outline-none transition-all ${isDark ? 'bg-[#3d354e] text-white focus:ring-2 ring-indigo-500/50' : 'bg-gray-50 border focus:border-indigo-500'}`}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl mt-4 transition-all ${loading ? 'opacity-50 cursor-wait' : 'active:scale-95'}`}
                        >
                            {loading ? 'Signing in...' : 'Log In'}
                        </button>
                    </form>

                    <p className={`text-center mt-8 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Don't have an account? <Link to="/register" className="text-indigo-500 font-bold hover:underline">Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;