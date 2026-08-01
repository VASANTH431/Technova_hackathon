import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Calendar, MapPin, Award, ArrowRight, Trophy, Code, AlarmClock, GraduationCap, PenTool, Mic, Sparkles } from 'lucide-react';

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const navigate = useNavigate();

    const categories = [
        { name: 'All', icon: Award, filterValue: 'All' },
        { name: 'Competitions', icon: Trophy, filterValue: 'Competition' },
        { name: 'Hackathons', icon: Code, filterValue: 'Hackathon' },
        { name: 'Quizzes', icon: AlarmClock, filterValue: 'Quiz' },
        { name: 'Scholarships', icon: GraduationCap, filterValue: 'Scholarship' },
        { name: 'Workshops', icon: PenTool, filterValue: 'Workshop' },
        { name: 'Conferences', icon: Mic, filterValue: 'Conference' },
        { name: 'Cultural Events', icon: Sparkles, filterValue: 'Cultural Event' }
    ];

    const getCategoryIcon = (categoryStr) => {
        const cat = categories.find(c => c.filterValue === categoryStr);
        if (cat && cat.icon) {
            const IconComponent = cat.icon;
            return <IconComponent size={24} className="text-white" />;
        }
        return <Award size={24} className="text-white" />;
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Determine if user is logged in
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login/user');
                    return;
                }

                const res = await axios.get('http://localhost:5000/api/events', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // For users, the backend already filters to Published/Ongoing
                setEvents(res.data);
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [navigate]);

    const filteredEvents = events.filter(e => {
        const matchesCat = activeCategory === 'All' || e.category === activeCategory;
        const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4"
                    >
                        Explore Opportunities
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        Find the perfect hackathon, workshop, or conference to elevate your career and skills.
                    </motion.p>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                    {/* Categories Strip */}
                    <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:max-w-2xl">
                        {categories.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.filterValue)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${activeCategory === cat.filterValue ? 'bg-indigo-700 text-white shadow-lg shadow-indigo-200 block' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80 shrink-0">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-sm shadow-sm transition-all outline-none"
                            placeholder="Search completely..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-32">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center bg-white rounded-3xl py-20 px-6 border border-dashed border-slate-300 shadow-sm">
                        <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">No events found</h3>
                        <p className="text-slate-500 mt-2">Try adjusting your category or search term.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (index % 10) * 0.05 }}
                                key={event._id}
                                className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:border-indigo-200 transition-all group flex flex-col h-full transform hover:-translate-y-1"
                            >
                                <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                    {event.bannerImage ? (
                                        <img src={`http://localhost:5000${event.bannerImage}`} alt="banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                                            {getCategoryIcon(event.category)}
                                            <span className="mt-2 text-2xl font-bold uppercase tracking-wider">{event.category}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-black text-indigo-700 uppercase tracking-widest shadow-sm">
                                        {event.category}
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center shadow-lg border border-white/10">
                                        <Calendar size={14} className="mr-1.5" />
                                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors leading-snug">{event.title}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed flex-1">
                                        {event.shortDescription || 'No description provided.'}
                                    </p>

                                    <div className="mt-auto pt-5 flex justify-between items-center border-t border-slate-100">
                                        <span className="flex items-center text-xs text-slate-500 font-medium truncate max-w-[50%] mr-2">
                                            <MapPin className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
                                            <span className="truncate">{event.venue || 'Online'}</span>
                                        </span>
                                        <Link
                                            to={`/events/${event._id}`}
                                            className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm group-hover:shadow-md"
                                        >
                                            View Event <ArrowRight size={16} className="ml-1.5" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsList;
