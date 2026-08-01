import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar, MapPin, Users, User, Award, Briefcase, Video, Clock, Layout, CheckCircle, Bell, Star, TrendingUp, Download, ArrowRight, Activity, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import MyCertificates from './MyCertificates';

const UserDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');

    const [registrations, setRegistrations] = useState([]);

    // UI states
    const [now, setNow] = useState(new Date());
    const navigate = useNavigate();

    let user = {};
    try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== "undefined") {
            user = JSON.parse(userStr);
        }
    } catch (e) { console.error("User parse error", e); }
    const userInterests = user.interestedAreas || [];

    const categories = ['All', 'Recommended', 'Hackathon', 'Conference', 'Competition', 'Meeting', 'Job Offer', 'Internship'];

    // Dynamic Analytics & KPI Data 
    const completedCount = registrations.filter(r => r.event && new Date(r.event.endDate || r.event.startDate) < now).length;
    const upcomingRegCount = registrations.filter(r => r.event && new Date(r.event.startDate) > now).length;

    const kpiData = [
        { label: 'Registered Events', count: registrations.length, icon: Calendar, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
        { label: 'Upcoming Events', count: upcomingRegCount, icon: Clock, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
        { label: 'Completed Events', count: completedCount, icon: CheckCircle, color: 'from-emerald-400 to-green-600', shadow: 'shadow-green-500/20' },
        { label: 'Certificates Earned', count: Math.max(0, completedCount), icon: Award, color: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/20' },
        { label: 'Saved Wishlist', count: 0, icon: Bookmark, color: 'from-rose-400 to-red-500', shadow: 'shadow-red-500/20' },
        { label: 'Notifications', count: 0, icon: Bell, color: 'from-slate-600 to-slate-800', shadow: 'shadow-slate-500/20' },
    ];

    const catCounts = {};
    let totalCat = 0;
    registrations.forEach(r => {
        if (r.event && r.event.category) {
            catCounts[r.event.category] = (catCounts[r.event.category] || 0) + 1;
            totalCat++;
        }
    });

    const colors = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];
    const pieData = Object.keys(catCounts).map((key, index) => ({
        name: key,
        value: catCounts[key],
        color: colors[index % colors.length]
    }));
    if (pieData.length === 0) pieData.push({ name: 'No Data', value: 1, color: '#e2e8f0' });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = {};
    registrations.forEach(r => {
        const d = new Date(r.createdAt);
        const m = monthNames[d.getMonth()];
        monthlyData[m] = (monthlyData[m] || 0) + 1;
    });
    const lineData = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = monthNames[d.getMonth()];
        lineData.push({ name: m, participation: monthlyData[m] || 0 });
    }

    const recentActivity = [...registrations]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4)
        .map(r => ({
            title: `Registered for ${r.event?.title || 'Event'}`,
            time: new Date(r.createdAt).toLocaleDateString(),
            icon: Activity,
            color: 'text-indigo-500 bg-indigo-100'
        }));
    if (recentActivity.length === 0) {
        recentActivity.push({ title: 'Welcome to UnifyEvents!', time: 'Just now', icon: Star, color: 'text-yellow-500 bg-yellow-100' });
    }

    const notifications = registrations.length > 0 ? [
        { title: 'Registration Successful', desc: 'You have new upcoming events to prepare for.', unread: true },
        { title: 'Profile Ready', desc: 'Setup your profile completely to get better recommendations.', unread: false }
    ] : [
        { title: 'Welcome Explorer', desc: 'Start browsing hackathons and events to grow your skills.', unread: true }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login/user');

                const [eventRes, regRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/events', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:5000/api/registrations/my', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setEvents(eventRes.data.filter(e => ['Published', 'Ongoing', 'Completed'].includes(e.status)));
                setRegistrations(regRes.data);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();

        const tick = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(tick);
    }, [navigate]);

    const isRecommended = (event) => {
        if (!userInterests.length) return true;
        const eventText = `${event.title} ${event.category} ${event.topic || ''} ${event.shortDescription}`.toLowerCase();
        return userInterests.some(interest => eventText.includes(interest.toLowerCase()));
    };

    const filteredEvents = events.filter(e => {
        const matchesCategory = activeTab === 'All' ? true : (activeTab === 'Recommended' ? isRecommended(e) : e.category === activeTab);

        const titleMatch = e.title ? e.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const descMatch = e.shortDescription ? e.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) : false;

        return matchesCategory && (titleMatch || descMatch);
    });

    const getIcon = (category) => {
        switch (category) {
            case 'Hackathon': return <Award className="w-5 h-5" />;
            case 'Job Offer':
            case 'Internship': return <Briefcase className="w-5 h-5" />;
            case 'Online Event': return <Video className="w-5 h-5" />;
            default: return <Calendar className="w-5 h-5" />;
        }
    };

    // Calculate upcoming event prioritizing user registered events
    const regUpcoming = registrations.map(r => r.event).filter(e => e && new Date(e.startDate) > now).sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
    const globalUpcoming = events.length > 0 ? events.slice().sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).find(e => new Date(e.startDate) > now) || events[0] : null;
    const upcomingEvent = regUpcoming || globalUpcoming;

    const getTimeRemaining = (targetDate) => {
        const total = Date.parse(targetDate) - Date.parse(new Date());
        if (total <= 0) return { days: 0, hours: 0, minutes: 0 };
        return {
            days: Math.floor(total / (1000 * 60 * 60 * 24)),
            hours: Math.floor((total / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((total / 1000 / 60) % 60)
        };
    };

    const countdown = upcomingEvent ? getTimeRemaining(upcomingEvent.startDate) : { days: 0, hours: 0, minutes: 0 };

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {user.name?.split(' ')[0] || 'Explorer'}! 👋</h1>
                        <p className="text-slate-500 mt-1">Here's your activity overview and personalized recommendations.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm shadow-sm transition-all outline-none"
                            placeholder="Find hackathons, workshops..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {kpiData.map((kpi, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={idx}
                            className={`bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-5 shadow-lg shadow-slate-200/50 hover:${kpi.shadow} hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden`}
                        >
                            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity blur-xl"></div>

                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center text-white mb-3 shadow-md`}>
                                <kpi.icon size={20} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-1 relative z-10">
                                {kpi.count}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Analytics */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Line Chart */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-start transition-all hover:shadow-2xl">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                                    <TrendingUp className="mr-2 text-indigo-500" size={20} /> Participation Timeline
                                </h3>
                                <div className="w-full h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Line type="monotone" dataKey="participation" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Donut Chart */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-start transition-all hover:shadow-2xl">
                                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
                                    <Layout className="mr-2 text-pink-500" size={20} /> Categories Joined
                                </h3>
                                <div className="w-full h-64 relative flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                        <span className="text-3xl font-black text-slate-800">100%</span>
                                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Recommendation Grid Section */}
                        <div className="pt-4">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                                    <Star className="text-yellow-500 fill-yellow-500/20" size={24} /> Recommended For You
                                </h2>
                                <div className="flex overflow-x-auto hide-scrollbar gap-2 max-w-sm">
                                    <button
                                        onClick={() => setActiveTab('All')}
                                        className={`px-5 py-2 rounded-full text-sm font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 antialiased ${activeTab === 'All' ? 'bg-indigo-700 text-white shadow-md' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                    >
                                        Explore All
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('Certificates')}
                                        className={`px-5 py-2 rounded-full text-sm font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 antialiased ${activeTab === 'Certificates' ? 'bg-indigo-700 text-white shadow-md' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                                    >
                                        My Certificates
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center p-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
                                </div>
                            ) : activeTab === 'Certificates' ? (
                                <MyCertificates />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredEvents.map((event, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.05 }}
                                            key={event._id}
                                            className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all group flex flex-col h-full transform hover:-translate-y-1"
                                        >
                                            <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                                {event.bannerImage ? (
                                                    <img src={`http://localhost:5000${event.bannerImage}`} alt="banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                                                        {getIcon(event.category)}
                                                        <span className="mt-2 text-xl font-bold uppercase tracking-wider">{event.category}</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 uppercase tracking-wide shadow-sm">
                                                    {event.category}
                                                </div>
                                                {event.status === 'Completed' && (
                                                    <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide shadow-sm flex items-center border border-white/20">
                                                        <CheckCircle size={12} className="mr-1" /> Completed
                                                    </div>
                                                )}
                                                {event.status === 'Ongoing' && (
                                                    <div className="absolute top-4 right-4 bg-amber-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide shadow-sm flex items-center border border-white/20">
                                                        <Clock size={12} className="mr-1 shadow-sm" /> Ongoing
                                                    </div>
                                                )}
                                                <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center shadow-lg border border-white/10">
                                                    <Calendar size={14} className="mr-1.5" />
                                                    {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="p-5 flex flex-col flex-grow">
                                                <h3 className="text-xl font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                                                <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-100">
                                                    <span className="flex items-center text-xs text-slate-500 font-medium truncate max-w-[50%]">
                                                        <MapPin className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                                                        <span className="truncate">{event.venue || 'Online'}</span>
                                                    </span>
                                                    <Link
                                                        to={`/events/${event._id}`}
                                                        className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                                                    >
                                                        Details <ArrowRight size={14} className="ml-1" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {filteredEvents.length === 0 && (
                                        <div className="col-span-1 md:col-span-2 py-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
                                            No events match your criteria.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Panels & Widgets */}
                    <div className="space-y-8">

                        {/* 1. Quick Actions Panel */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} delay={0.5} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 relative z-10">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                {[
                                    { name: 'Browse Events', icon: Search, to: '/events', color: 'from-blue-500 to-cyan-500' },
                                    { name: 'My Registrations', icon: CheckCircle, onClick: () => setActiveTab('All'), color: 'from-emerald-500 to-teal-600' },
                                    { name: 'Certificates', icon: Download, onClick: () => setActiveTab('Certificates'), color: 'from-purple-500 to-fuchsia-600' },
                                    { name: 'My Profile', icon: User, to: '/profile', color: 'from-rose-500 to-orange-500' }
                                ].map((action, i) => (
                                    action.to ? (
                                        <Link key={i} to={action.to} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${action.color} text-white flex items-center justify-center mb-2 shadow-md transform group-hover:scale-110 transition-transform`}>
                                                <action.icon size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 text-center">{action.name}</span>
                                        </Link>
                                    ) : (
                                        <button key={i} onClick={action.onClick} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 transition-all group w-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${action.color} text-white flex items-center justify-center mb-2 shadow-md transform group-hover:scale-110 transition-transform`}>
                                                <action.icon size={18} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 text-center">{action.name}</span>
                                        </button>
                                    )
                                ))}
                            </div>
                        </motion.div>

                        {/* 2. Upcoming Event Focus */}
                        {upcomingEvent && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} delay={0.6} className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 rounded-3xl p-1 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="bg-slate-900/80 backdrop-blur-md rounded-[22px] p-6 relative z-10 w-full h-full border border-white/10 flex flex-col justify-between">
                                    <div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
                                            <Clock className="w-3 h-3 mr-1" /> Happening Next
                                        </span>
                                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{upcomingEvent.title}</h3>
                                        <p className="text-sm text-slate-400 flex items-center mt-2"><MapPin size={14} className="mr-1" /> {upcomingEvent.venue || 'Virtual Check-in'}</p>
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex gap-2 justify-between mb-4">
                                            <div className="bg-white/10 rounded-xl p-2 w-full text-center">
                                                <span className="block text-2xl font-black text-white">{countdown.days}</span>
                                                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Days</span>
                                            </div>
                                            <div className="bg-white/10 rounded-xl p-2 w-full text-center">
                                                <span className="block text-2xl font-black text-white">{countdown.hours}</span>
                                                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hours</span>
                                            </div>
                                            <div className="bg-white/10 rounded-xl p-2 w-full text-center">
                                                <span className="block text-2xl font-black text-white">{countdown.minutes}</span>
                                                <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mins</span>
                                            </div>
                                        </div>
                                        <Link to={`/events/${upcomingEvent._id}`} className="w-full flex items-center justify-center bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all">
                                            Enter Lobby <ArrowRight className="ml-2 w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. Recent Activity Tracker */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} delay={0.7} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                                Activity Log <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md cursor-pointer hover:bg-indigo-100">View All</span>
                            </h3>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200 pb-2">
                                {recentActivity.map((act, i) => (
                                    <div key={i} className="relative flex items-start gap-4">
                                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white ${act.color}`}>
                                            <act.icon size={16} />
                                        </div>
                                        <div className="pt-1 flex-1 min-w-0">
                                            <div className="text-sm font-bold text-slate-800 mb-1 leading-snug">{act.title}</div>
                                            <div className="text-xs font-semibold text-slate-400">{act.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* 4. Notifications Center */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} delay={0.8} className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-100">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center"><Bell size={16} className="mr-2 text-slate-500" /> Notifications</h3>
                                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">2 NEW</span>
                            </div>
                            <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                                {notifications.map((notif, i) => (
                                    <li key={i} className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${notif.unread ? 'bg-indigo-50/30' : ''}`}>
                                        <div className="mt-1">
                                            <div className={`w-2 h-2 rounded-full ${notif.unread ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm mb-0.5 ${notif.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{notif.title}</p>
                                            <p className="text-xs text-slate-500 line-clamp-2">{notif.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-slate-100 p-3 text-center">
                                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">Mark All Read</button>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
