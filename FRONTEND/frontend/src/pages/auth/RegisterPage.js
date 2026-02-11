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

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMsg) setErrorMsg(''); // Clear error when user types
    };

    // Handle File upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) { // 5MB Limit check
            alert("File is too large. Please upload an image under 5MB.");
            e.target.value = null;
            return;
        }
        setFormData({ ...formData, kyc_id: file });
    };

    // Triggered by the main form submit
    const handleRegisterClick = (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.username || !formData.email || !formData.password) {
            return setErrorMsg("Please fill in all required fields.");
        }
        if (!formData.kyc_id) {
            return setErrorMsg("National ID upload is required for security.");
        }

        setShowTerms(true);
    };

    // Final API Call after clicking "I Agree"
    const finalizeRegistration = async () => {
        setShowTerms(false);
        setLoading(true);
        setErrorMsg('');

        // Prepare Multipart Form Data
        const data = new FormData();
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('first_name', formData.firstName);
        data.append('last_name', formData.lastName);
        data.append('role', formData.role);
        data.append('kyc_id', formData.kyc_id);

        console.log("Submitting registration for:", formData.username);

        try {
            const response = await API.post('/api/auth/register/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("Registration Successful:", response.data);
            
            // If your backend returns tokens, save them here
            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
            }

            alert("Account created successfully! Welcome to Companion.");
            navigate('/dashboard'); // or /login

        } catch (err) {
    console.error("Registration Error Response:", err.response?.data);
    
    // This will turn {"username": ["Taken"]} into "username: Taken"
    const errorData = err.response?.data;
    let finalMessage = "Registration failed: ";

    if (errorData && typeof errorData === 'object') {
        const details = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value.join(', ')}`)
            .join(' | ');
        finalMessage += details;
    } else {
        finalMessage = "Server error. Please try again.";
    }

    alert(finalMessage);
    setErrorMsg(finalMessage);
}
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 ${isDark ? 'bg-[#1a1625]' : 'bg-gray-100'}`}>
            {/* Theme Toggle */}
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl z-50 transition-transform active:scale-90">
                {isDark ? '☀️' : '🌙'}
            </button>

            <div className={`flex w-full max-w-6xl ${isDark ? 'bg-[#2d2739]' : 'bg-white'} rounded-[40px] shadow-2xl overflow-hidden min-h-[750px] relative`}>
                
                {/* Left Side: Visuals */}
                <div className="hidden md:block w-1/2 relative">
                    <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" alt="Happy People" />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent"></div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                    <h2 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Join Us</h2>
                    <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Verify your identity to get started.</p>
                    
                    {errorMsg && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-2xl text-sm">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleRegisterClick} className="space-y-4">
                        <div className="flex gap-4">
                            <input name="firstName" type="text" placeholder="First Name" className={`flex-1 p-4 rounded-2xl outline-none transition-all ${isDark ? 'bg-[#3d354e] text-white focus:bg-[#4a415e]' : 'bg-gray-50 border focus:border-indigo-500'}`} onChange={handleChange} />
                            <input name="lastName" type="text" placeholder="Last Name" className={`flex-1 p-4 rounded-2xl outline-none transition-all ${isDark ? 'bg-[#3d354e] text-white focus:bg-[#4a415e]' : 'bg-gray-50 border focus:border-indigo-500'}`} onChange={handleChange} />
                        </div>
                        
                        <div className="flex gap-4">
                            <input name="username" type="text" placeholder="Username *" required className={`flex-1 p-4 rounded-2xl outline-none ${isDark ? 'bg-[#3d354e] text-white' : 'bg-gray-50 border'}`} onChange={handleChange} />
                            <select name="role" className={`p-4 rounded-2xl outline-none cursor-pointer ${isDark ? 'bg-[#3d354e] text-white' : 'bg-gray-50 border'}`} onChange={handleChange}>
                                <option value="client">Client</option>
                                <option value="provider">Provider</option>
                            </select>
                        </div>

                        <input name="email" type="email" placeholder="Email Address *" required className={`w-full p-4 rounded-2xl outline-none ${isDark ? 'bg-[#3d354e] text-white' : 'bg-gray-50 border'}`} onChange={handleChange} />
                        <input name="password" type="password" placeholder="Password *" required className={`w-full p-4 rounded-2xl outline-none ${isDark ? 'bg-[#3d354e] text-white' : 'bg-gray-50 border'}`} onChange={handleChange} />
                        
                        <div className="space-y-1">
                            <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>National ID (Citizenship/License) *</label>
                            <input type="file" accept="image/*" required onChange={handleFileChange} className={`w-full p-3 rounded-2xl outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDark ? 'bg-[#3d354e] text-gray-400 file:bg-indigo-600 file:text-white' : 'bg-gray-50 border file:bg-indigo-100 file:text-indigo-700'}`} />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl mt-4 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Create account'}
                        </button>
                    </form>

                    <p className={`text-center mt-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Already have an account? <Link to="/login" className="text-indigo-500 font-bold hover:underline">Login</Link>
                    </p>
                </div>
            </div>

            {/* Terms Modal */}
            {showTerms && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className={`max-w-2xl w-full p-8 rounded-[35px] shadow-2xl ${isDark ? 'bg-[#2d2739] text-white' : 'bg-white text-gray-900'}`}>
                        <h3 className="text-2xl font-bold mb-4 border-b border-indigo-500/30 pb-2">Safety Agreement</h3>
                        <div className="max-h-60 overflow-y-auto mb-6 text-sm opacity-80 leading-relaxed pr-4 custom-scrollbar">
                            <p className="mb-3"><strong>1. ID Verification:</strong> You agree that the uploaded ID is authentic. Providing false documents will lead to immediate permanent suspension and potential legal report.</p>
                            <p className="mb-3"><strong>2. Eligibility:</strong> You confirm you are at least 18 years of age.</p>
                            <p className="mb-3"><strong>3. Payment Policy:</strong> All initial transactions must go through our platform to ensure safety and refund eligibility.</p>
                            <p><strong>4. Code of Conduct:</strong> Respectful behavior is mandatory. Any harassment reported by clients or providers will be investigated via your trust score.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setShowTerms(false)} className="flex-1 py-4 rounded-xl bg-gray-500/20 font-bold hover:bg-gray-500/30 transition-colors">Decline</button>
                            <button onClick={finalizeRegistration} className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30">Accept & Register</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterPage;