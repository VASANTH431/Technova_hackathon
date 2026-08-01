import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Shield, Trash2, Calendar, Edit, Eye, AlertTriangle,
    Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
    Activity, LayoutDashboard, FileText, Users, Plus, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortOption, setSortOption] = useState('Newest');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login/admin');

                const res = await axios.get('http://localhost:5000/api/events', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchEvents();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm('WARNING: Are you sure you want to delete this event across the entire platform? This cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(events.filter(e => e._id !== id));
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    // Process Events
    const processedEvents = useMemo(() => {
        return events
            .filter(e => filterStatus === 'All' || e.status === filterStatus)
            .filter(e =>
                e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortOption === 'Newest') return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate);
                if (sortOption === 'Oldest') return new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate);
                if (sortOption === 'A-Z') return a.title.localeCompare(b.title);
                return 0;
            });
    }, [events, searchTerm, filterStatus, sortOption]);

    const totalPages = Math.ceil(processedEvents.length / itemsPerPage);
    const paginatedEvents = processedEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const stats = {
        total: events.length,
        published: events.filter(e => e.status === 'Published').length,
        draft: events.filter(e => e.status === 'Draft').length,
        upcoming: events.filter(e => new Date(e.startDate) > new Date()).length
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden text-slate-800 selection:bg-indigo-100 font-sans pb-20">
            {/* Soft Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>
            <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full bg-blue-400/10 blur-[120px] mix-blend-multiply pointer-events-none animate-pulse-slow"></div>
            <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[100px] mix-blend-multiply pointer-events-none animate-pulse-slow"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">

                {/* Hero Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12"
                >
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-indigo-600 rounded-2xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-0.5 shadow-xl flex items-center justify-center border border-white/20">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">System Admin Console</h1>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 whitespace-nowrap text-emerald-700 text-xs font-bold border border-emerald-200 shadow-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative"></span>
                                    System Online
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium text-lg flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-indigo-400" /> Elevated Privileges Active &bull; {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { title: 'Total Events', value: stats.total, icon: LayoutDashboard, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50/50', border: 'border-blue-100' },
                        { title: 'Published', value: stats.published, icon: CheckCircle, color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
                        { title: 'Draft Events', value: stats.draft, icon: FileText, color: 'from-slate-400 to-slate-500', bg: 'bg-slate-100/50', border: 'border-slate-200' },
                        { title: 'Upcoming Events', value: stats.upcoming, icon: Calendar, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50/50', border: 'border-purple-100' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + (i * 0.1), duration: 0.5 }}
                            className={`relative overflow-hidden rounded-3xl border ${stat.border} ${stat.bg} backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 group`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                            <div className="p-6 relative z-10 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.title}</p>
                                    <h3 className="text-4xl font-extrabold text-slate-800">{loading ? '-' : stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg text-white transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Table Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] border border-white/60 overflow-hidden"
                >
                    {/* Controls Bar */}
                    <div className="p-6 border-b border-slate-100/80 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search events by title or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all font-medium text-slate-700 shadow-sm"
                            />
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full md:w-auto appearance-none pl-4 pr-10 py-3 bg-white/80 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-700 shadow-sm cursor-pointer"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                </select>
                                <Filter className="absolute right-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="relative flex-1 md:flex-none">
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="w-full md:w-auto appearance-none pl-4 pr-10 py-3 bg-white/80 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 font-medium text-slate-700 shadow-sm cursor-pointer"
                                >
                                    <option value="Newest">Newest First</option>
                                    <option value="Oldest">Oldest First</option>
                                    <option value="A-Z">A-Z</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="min-h-[400px]">
                        {loading ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <div className="flex flex-col items-center gap-4 text-indigo-500">
                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                                    <p className="font-medium text-slate-500">Synchronizing records...</p>
                                </div>
                            </div>
                        ) : processedEvents.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center p-8">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <Search className="h-10 w-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No matching events found</h3>
                                <p className="text-slate-500 max-w-md">Try adjusting your search query or filters to find what you're looking for.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-100 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="px-8 py-5 rounded-tl-2xl">Event Details</th>
                                            <th className="px-6 py-5">Status</th>
                                            <th className="px-6 py-5">Date Scheduled</th>
                                            <th className="px-8 py-5 text-right rounded-tr-2xl">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence mode="popLayout">
                                            {paginatedEvents.map((event, index) => (
                                                <motion.tr
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    key={event._id}
                                                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                                                >
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center shadow-sm border border-indigo-100 text-indigo-600 font-bold">
                                                                {event.title.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-base mb-0.5 group-hover:text-indigo-600 transition-colors">{event.title}</p>
                                                                <p className="text-xs font-semibold text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded-md">{event.category} &bull; {event.eventType}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border ${event.status === 'Published'
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                            : 'bg-amber-50 border-amber-200 text-amber-700'
                                                            }`}>
                                                            {event.status === 'Published' && <CheckCircle size={12} />}
                                                            {event.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-600 flex items-center gap-2 mt-2">
                                                        <Calendar size={16} className="text-slate-400" />
                                                        {new Date(event.startDate || event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => navigate(`/events/${event._id}`)}
                                                                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/organiser/edit-event/${event._id}`)}
                                                                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-500/20"
                                                                title="Edit Event"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(event._id)}
                                                                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-rose-500/20"
                                                                title="Delete Event"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Showing <span className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, processedEvents.length)}</span> of <span className="text-slate-800">{processedEvents.length}</span> results
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-9 h-9 rounded-xl font-bold text-sm transition-all shadow-sm ${currentPage === i + 1
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
