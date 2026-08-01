import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Phone, Lock, Tag } from 'lucide-react';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        interestedAreas: [],
        role: 'User'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const interestOptions = ['Technology', 'Business', 'Design', 'Arts', 'Music', 'Science', 'Sports'];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInterestChange = (area) => {
        if (formData.interestedAreas.includes(area)) {
            setFormData({ ...formData, interestedAreas: formData.interestedAreas.filter(a => a !== area) });
        } else {
            setFormData({ ...formData, interestedAreas: [...formData.interestedAreas, area] });
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/signup', formData);
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));

                // Redirect logic
                if (res.data.user.role === 'Organiser') {
                    navigate('/organiser-dashboard');
                } else {
                    navigate('/user-dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Signup Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/google', {
                token: credentialResponse.credential,
                role: formData.role
            });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));

                if (res.data.user.role === 'Organiser') {
                    navigate('/organiser-dashboard');
                } else {
                    navigate('/user-dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Google Sign Up Failed');
        }
    };

    const handleGoogleError = () => {
        setError('Google Sign Up Failed');
    };

    return (
        <div className="min-h-screen flex items-center justify-center pt-16 relative bg-slate-50 py-10">
            <div className="absolute top-10 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-md shadow-2xl p-10 rounded-3xl w-full max-w-2xl relative z-10 mx-4 border border-white"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-2xl shadow-lg bg-gradient-to-tr from-blue-600 to-indigo-600">
                        <User size={40} className="text-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center mb-2 text-slate-800">Create Account</h2>
                <p className="text-center text-slate-500 mb-8">Join the UnifyEvents platform</p>

                {error && <div className="p-3 mb-6 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{error}</div>}

                <div className="mb-6 flex flex-col items-center justify-center max-w-md mx-auto">
                    <p className="text-sm font-medium text-slate-700 mb-3 block w-full text-left">Select Account Type first, then Sign Up:</p>
                    <div className="w-full relative mb-4">
                        <Briefcase className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm appearance-none"
                        >
                            <option value="User">Participant</option>
                            <option value="Organiser">Organiser</option>
                        </select>
                    </div>

                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_blue"
                        shape="pill"
                        size="large"
                        text="signup_with"
                    />

                    <div className="w-full relative flex items-center my-6 py-2">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or fill details manually</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                                    placeholder="Secure Password"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                                    placeholder="Phone Number"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <Tag size={16} className="text-slate-500" />
                            Select Interested Areas
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {interestOptions.map((area) => (
                                <button
                                    type="button"
                                    key={area}
                                    onClick={() => handleInterestChange(area)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.interestedAreas.includes(area)
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded-xl shadow-lg transition-all focus:ring-4 focus:outline-none flex justify-center items-center max-w-md w-full"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up Now'}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Already have an account? <Link to="/" className="font-semibold text-blue-600 hover:underline">Go to Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default SignUp;
