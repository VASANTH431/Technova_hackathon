import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Shield, Briefcase } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
    const { role } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const getRoleTheme = () => {
        switch (role) {
            case 'admin': return { color: 'text-rose-500', bg: 'bg-rose-500', icon: <Shield size={40} className="text-white" /> };
            case 'organiser': return { color: 'text-indigo-500', bg: 'bg-indigo-500', icon: <Briefcase size={40} className="text-white" /> };
            default: return { color: 'text-blue-500', bg: 'bg-blue-500', icon: <UserIcon size={40} className="text-white" /> };
        }
    };

    const theme = getRoleTheme();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/google', {
                token: credentialResponse.credential,
                role: role.charAt(0).toUpperCase() + role.slice(1) // e.g. 'Admin'
            });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate(`/${role}-dashboard`);
            }
        } catch (err) {
            if (err.code === 'ERR_NETWORK') {
                setError('Backend Unreachable: Check if server is running and MongoDB Atlas IP is whitelisted.');
            } else {
                setError(err.response?.data?.error || 'Authentication Failed');
            }
        }
    };

    const handleGoogleError = () => {
        setError('Google Login Failed');
    };

    const handleDevLogin = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/dev-login', {
                role: role.charAt(0).toUpperCase() + role.slice(1)
            });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate(`/${role}-dashboard`);
            }
        } catch (err) {
            if (err.code === 'ERR_NETWORK') {
                setError('Backend Unreachable: Check if server is running and MongoDB Atlas IP is whitelisted.');
            } else {
                setError(err.response?.data?.error || 'Bypass Login Failed');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center pt-16 relative">
            <div className="absolute top-10 left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-10 rounded-3xl w-full max-w-md relative z-10 mx-4"
            >
                <div className="flex justify-center mb-6">
                    <div className={`p-4 rounded-2xl shadow-lg ${theme.bg}`}>
                        {theme.icon}
                    </div>
                </div>

                <h2 className={`text-3xl font-bold text-center mb-8 capitalize text-slate-800`}>
                    {role} Portal Access
                </h2>

                {error && <div className="p-3 mb-6 bg-red-100 text-red-700 rounded-lg text-sm font-medium">{error}</div>}

                <div className="flex justify-center flex-col items-center gap-4">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="filled_blue"
                        shape="pill"
                        size="large"
                    />

                    <div className="w-full relative flex items-center my-4 py-2">
                        <div className="flex-grow border-t border-slate-300"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-slate-300"></div>
                    </div>

                    <button
                        onClick={handleDevLogin}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-full transition-all focus:ring-4 focus:outline-none flex items-center justify-center gap-2"
                    >
                        Bypass Login (Dev Mode)
                    </button>
                </div>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Not an authorized {role}? <Link to="/" className="font-semibold text-blue-600 hover:underline">Return Home</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
