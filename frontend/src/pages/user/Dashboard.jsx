import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar, MapPin, Users, User, Award, Briefcase, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const UserDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const navigate = useNavigate();

    const categories = ['All', 'Hackathon', 'Conference', 'Competition', 'Meeting', 'Job Offer', 'Internship'];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login/user');

                const res = await axios.get('http://localhost:5000/api/events', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Users only see Published events (handled by backend but filtering just in case)
                setEvents(res.data.filter(e => e.status === 'Published'));
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchEvents();
    }, [navigate]);

    const filteredEvents = events.filter(e =>
        (activeTab === 'All' || e.category === activeTab) &&
        (e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getIcon = (category) => {
        switch (category) {
            case 'Hackathon': return <Award className="w-5 h-5" />;
            case 'Job Offer':
            case 'Internship': return <Briefcase className="w-5 h-5" />;
            case 'Online Event': return <Video className="w-5 h-5" />;
            default: return <Calendar className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 tracking-tight mb-4">Discover Your Next Opportunity</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">Browse through our curated list of hackathons, internships, jobs, and conferences.</p>

                    <div className="mt-8 max-w-xl mx-auto relative flex items-center">
                        <Search className="absolute left-4 z-10 text-slate-400" />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 text-lg shadow-sm transition-all"
                            placeholder="Search opportunities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-10 pb-2 justify-center">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-all ${activeTab === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={event._id}
                                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl transition-all group flex flex-col h-full"
                            >
                                <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                    {event.bannerImage ? (
                                        <img src={`http://localhost:5000${event.bannerImage}`} alt="banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                                            {getIcon(event.category)}
                                            <span className="mt-2 text-xl font-bold uppercase tracking-wider">{event.category}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 uppercase tracking-wide">
                                        {event.category}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white flex items-center">
                                        {event.eventType === 'Team' ? <><Users size={14} className="mr-1" /> Team</> : <><User size={14} className="mr-1" /> Solo</>}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">{event.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-6">{event.shortDescription}</p>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex items-center text-sm text-slate-600 font-medium bg-slate-50 p-2 rounded-lg">
                                            <Calendar className="w-4 h-4 mr-3 text-indigo-500" />
                                            {new Date(event.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center text-sm text-slate-600 font-medium bg-slate-50 p-2 rounded-lg truncate">
                                            <MapPin className="w-4 h-4 mr-3 text-indigo-500 shrink-0" />
                                            <span className="truncate">{event.venue || 'Online'}</span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/events/${event._id}`}
                                        className="mt-6 w-full text-center bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold py-3 rounded-xl transition-colors duration-300"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
