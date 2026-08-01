import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Tag, Camera, CheckCircle, Edit2, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        interestedAreas: [],
        profileImage: ''
    });
    const navigate = useNavigate();

    const interestOptions = ['Technology', 'Business', 'Design', 'Arts', 'Music', 'Science', 'Sports'];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login/user');

                const res = await axios.get('http://localhost:5000/api/user/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUser(res.data);
                setFormData({
                    name: res.data.name || '',
                    phoneNumber: res.data.phoneNumber || '',
                    interestedAreas: res.data.interestedAreas || [],
                    profileImage: res.data.profileImage || ''
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/user/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setMessage('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-800"></div>
            </div>
        );
    }

    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0F172A&color=fff&size=256&font-size=0.4`;

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 relative"
                >
                    <div className="bg-slate-800 h-40 relative">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2"
                            >
                                <Edit2 size={16} /> Edit Profile
                            </button>
                        )}
                    </div>
                    <div className="px-8 pb-10">
                        <div className="relative -mt-20 mb-8 flex flex-col items-center sm:items-start sm:flex-row sm:gap-8">
                            <div className="relative group">
                                <div className="w-36 h-36 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                                    <img
                                        src={formData.profileImage || defaultAvatarUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera className="text-white" size={28} />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 sm:mt-20 text-center sm:text-left flex-1">
                                <h1 className="text-3xl font-bold text-slate-800">{user.name}</h1>
                                <p className="text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-2 mt-1">
                                    <Mail size={16} /> {user.email}
                                </p>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 mb-6 rounded-xl flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                <CheckCircle size={20} /> {message}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column: Personal Information */}
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <User className="text-slate-400" /> Personal Information
                                    </h2>

                                    {!isEditing ? (
                                        <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 mb-1">Full Name</p>
                                                    <p className="text-slate-800 font-medium text-lg">{user.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 mb-1">Phone Number</p>
                                                    <p className="text-slate-800 font-medium text-lg">{user.phoneNumber || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <AnimatePresence>
                                            <motion.form
                                                onSubmit={handleSubmit}
                                                className="space-y-6"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                                            <input
                                                                type="text"
                                                                name="name"
                                                                value={formData.name}
                                                                onChange={handleInputChange}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-slate-800 focus:bg-white outline-none transition-all font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                                            <input
                                                                type="tel"
                                                                name="phoneNumber"
                                                                value={formData.phoneNumber || ''}
                                                                onChange={handleInputChange}
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-slate-800 focus:bg-white outline-none transition-all font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Profile Image URL</label>
                                                        <div className="relative">
                                                            <Camera className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                                            <input
                                                                type="text"
                                                                name="profileImage"
                                                                value={formData.profileImage || ''}
                                                                onChange={handleInputChange}
                                                                placeholder="Paste an image URL (optional)"
                                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-slate-800 focus:bg-white outline-none transition-all font-medium"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-6 gap-3 border-t border-slate-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsEditing(false);
                                                            setFormData({
                                                                ...formData,
                                                                name: user.name,
                                                                phoneNumber: user.phoneNumber,
                                                                profileImage: user.profileImage,
                                                                interestedAreas: user.interestedAreas
                                                            });
                                                        }}
                                                        className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-2"
                                                    >
                                                        <X size={18} /> Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={saving}
                                                        className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg shadow-slate-800/20 transition-all flex items-center gap-2"
                                                    >
                                                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                                    </button>
                                                </div>
                                            </motion.form>
                                        </AnimatePresence>
                                    )}
                                </section>
                            </div>

                            {/* Right Column: Interests */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Tag className="text-slate-400" size={20} /> Interested Areas
                                </h2>

                                {isEditing ? (
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-4 font-medium">Select areas to personalize your recommendations:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {interestOptions.map((area) => (
                                                <button
                                                    type="button"
                                                    key={area}
                                                    onClick={() => handleInterestChange(area)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${formData.interestedAreas.includes(area)
                                                        ? 'bg-slate-800 text-white border-slate-800'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {area}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {user.interestedAreas && user.interestedAreas.length > 0 ? (
                                            user.interestedAreas.map((area, idx) => (
                                                <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                                    {area}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">No interests selected.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
