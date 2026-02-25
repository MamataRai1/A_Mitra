import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api';

const RegisterPage = () => {
    const navigate = useNavigate();
    
    // UI State
    const [theme, setTheme] = useState('dark');
    const [showTerms, setShowTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'client', 
        kyc_id: null
    });

    const isDark = theme === 'dark';

    // 1. Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errorMsg) setErrorMsg(''); 
    };

    // 2. Handle File Upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) { 
            alert("File too large. Max 5MB allowed.");
            e.target.value = null;
            return;
        }
        setFormData({ ...formData, kyc_id: file });
    };

    // 3. Triggered by the "Create Account" button
    const handleRegisterClick = (e) => {
        e.preventDefault();
        
        // Validation before showing terms
        if (!formData.username || !formData.email || !formData.password) {
            return setErrorMsg("Please fill in all required fields (*).");
        }
        if (!formData.kyc_id) {
            return setErrorMsg("Please upload your National ID for verification.");
        }
        if (formData.username.includes(" ")) {
            return setErrorMsg("Username cannot contain spaces.");
        }

        setShowTerms(true);
    };

    // 4. Final API call triggered by "I Agree" button inside Modal
    const finalizeRegistration = async () => {
        setShowTerms(false);
        setLoading(true);
        setErrorMsg('');

        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('first_name', formData.firstName);
        data.append('last_name', formData.lastName);
        data.append('role', formData.role); 
        data.append('kyc_id', formData.kyc_id);

        try {
            console.log("Attempting registration for role:", formData.role);
            const response = await API.post('/auth/register/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("Registration Successful:", response.data);
            alert(`Account created successfully as a ${formData.role}!`);
            navigate('/login');

        } catch (err) {
            console.error("Backend Error:", err.response?.data);
            const errorData = err.response?.data;
            let finalMessage = "Registration failed: ";

            if (errorData && typeof errorData === 'object') {
                const details = Object.entries(errorData)
                    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                    .join(' | ');
                finalMessage += details;
            } else {
                finalMessage = "Connection error. Check your server.";
            }
            setErrorMsg(finalMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 ${isDark ? 'bg-[#1a1625]' : 'bg-gray-100'}`}>
            
            {/* Theme Toggle */}
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl z-50 transition-transform active:scale-95">
                {isDark ? '☀️' : '🌙'}
            </button>

            <div className={`flex w-full max-w-6xl ${isDark ? 'bg-[#2d2739]' : 'bg-white'} rounded-[40px] shadow-2xl overflow-hidden min-h-[750px] relative`}>
                
                {/* Visual Image Section */}
                <div className="hidden md:block w-1/2 relative">
                    <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" alt="Community" />
                    <div className="absolute inset-0 bg-indigo-900/20"></div>
                </div>

                {/* Form Section */}
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                    <h2 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Companion</h2>
                    <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create your account to join our community.</p>
                    
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-2xl text-sm font-medium">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleRegisterClick} className="space-y-4">
                        <div className="flex gap-4">
                            <input name="firstName" type="text" placeholder="First Name" className={`flex-1 p-4 rounded-2xl outline-none transition-all ${isDark ? 'bg-[#3d354e] text-white focus:ring-2 ring-indigo-500/50' : 'bg-gray-50 border'}`} onChange={handleChange} />
                            <input name="lastName" type="text" placeholder="Last Name" className={`flex-1 p-4 rounded-2xl outline-none transition-all ${isDark ? 'bg-[#3d354e] text-white focus:ring-2 ring-indigo-500/50' : 'bg-gray-50 border'}`} onChange={handleChange} />
                        </div>
                        
                        <div className="flex gap-4">
                            <input name="username" type="text" placeholder="Username *" required className={`flex-1 p-4 rounded-2xl outline-none ${isDark ? 'bg-[#3d354e] text-white focus:ring-2 ring-indigo-500/50' : 'bg-gray-50 border'}`} onChange={handleChange} />
                            <select name="role" value={formData.role} className={`p-4 rounded-2xl outline-none cursor-pointer font-bold ${isDark ? 'bg-[#3d354e] text-white' : 'bg-gray-50 border'}`} onChange={handleChange}>
                                <option value="client">Register as Client</option>
                                <option value="provider">Register as Provider</option>
                            </select>
                        </div>

                        <input name="email" type="email" placeholder="Email Address *" required className={`w-full p-4 rounded-2xl outline-none ${isDark ? 'bg-[#3d354e] text-white focus:ring-2 ring-indigo-500/50' : 'bg-gray-50 border'}`} onChange={handleChange} />
                        <input name="password" type="password" placeholder="Password *" required className={`w-full p-4 rounded-2xl outline-none ${isDark ? 'bg-[#3d354e] text-white focus:ring-2 ring-indigo-500/50' : 'bg-gray-50 border'}`} onChange={handleChange} />
                        
                        <div className="space-y-1">
                            <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Upload National ID (Citizenship/License) *</label>
                            <input type="file" accept="image/*" required onChange={handleFileChange} className={`w-full p-3 rounded-2xl outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold ${isDark ? 'bg-[#3d354e] text-gray-400 file:bg-indigo-600 file:text-white' : 'bg-gray-50 border file:bg-indigo-100 file:text-indigo-700'}`} />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl mt-4 transition-all ${loading ? 'opacity-50 cursor-wait' : 'active:scale-95'}`}
                        >
                            {loading ? 'Creating Account...' : 'Create account'}
                        </button>
                    </form>

                    <p className={`text-center mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Already have an account? <Link to="/login" className="text-indigo-500 font-bold hover:underline">Login</Link>
                    </p>
                </div>
            </div>

            {/* --- TERMS & CONDITIONS MODAL --- */}
            {showTerms && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className={`max-w-3xl w-full p-8 rounded-[40px] shadow-2xl border ${isDark ? 'bg-[#2d2739] text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-3xl font-bold">Terms & Conditions</h3>
                                <p className="text-xs opacity-50 uppercase tracking-widest mt-1">Companion Rental Platform • Feb 2026</p>
                            </div>
                            <div className={`px-4 py-1 rounded-full text-[10px] font-black ${formData.role === 'provider' ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                                {formData.role.toUpperCase()}
                            </div>
                        </div>
                        
                        {/* Scrollable Terms Content */}
                        <div className="max-h-[400px] overflow-y-auto mb-8 pr-4 text-sm leading-relaxed opacity-90 custom-scrollbar space-y-4">
                            <p><strong>1. Acceptance:</strong> By registering, you agree to be legally bound by these terms.</p>
                            
                            {formData.role === 'client' ? (
                                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                    <h4 className="font-bold text-indigo-500 mb-1">👤 CLIENT AGREEMENT</h4>
                                    <p>You agree to provide accurate info, treat providers with respect, and complete all payments through the platform. Attempting to bypass platform fees will result in a permanent ban.</p>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                    <h4 className="font-bold text-amber-500 mb-1">🧑‍💼 PROVIDER AGREEMENT</h4>
                                    <p>You agree to provide truthful profile data, deliver services professionally, and acknowledge you are an independent contractor. Fraudulent activity results in forfeiture of earnings.</p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-bold mb-1">🔒 GENERAL TERMS</h4>
                                <p><strong>Age:</strong> You confirm you are 18 years or older. <br/>
                                <strong>Liability:</strong> The platform acts as a marketplace. We are not liable for personal disputes, off-platform interactions, or damages during services. <br/>
                                <strong>Conduct:</strong> Harassment leads to immediate account termination and potential legal action.</p>
                            </div>
                        </div>

                        {/* Agreement Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => setShowTerms(false)} 
                                className={`flex-1 py-4 rounded-2xl font-bold transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                            >
                                Decline
                            </button>
                            <button 
                                onClick={finalizeRegistration} 
                                className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/40"
                            >
                                I Agree & Register
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;