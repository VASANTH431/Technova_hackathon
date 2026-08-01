import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Calendar, MapPin, Users, Trophy, Code, AlarmClock, GraduationCap, PenTool, Mic, Sparkles, ChevronRight, Award, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const OrganiserDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const filteredEvents = events.filter(e => activeCategory === 'All' || e.category === activeCategory);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login/organiser');

                const res = await axios.get('http://localhost:5000/api/events', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const user = JSON.parse(localStorage.getItem('user'));
                // Filter to only this organiser's events on the frontend since the backend returns all for admins/organisers
                const myEvents = res.data.filter(e => e.organiser === user.id);
                setEvents(myEvents);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch events', err);
                setLoading(false);
            }
        };
        fetchEvents();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md hover:bg-slate-50 transition-all border border-slate-200 group"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="h-6 w-6 text-slate-600 group-hover:text-slate-900" />
                            </button>
                            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Organiser Command Center</h1>
                        </div>
                        <p className="mt-3 text-lg text-slate-600 sm:ml-[3.25rem]">Manage your conferences, hackathons, and global opportunities.</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            to="/organiser/create-event"
                            className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-base font-medium rounded-full text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
                        >
                            <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                            Create New Opportunity
                        </Link>
                    </div>
                </div>

                {/* Categories Strip */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mb-10 relative w-full"
                >
                    <div className="flex overflow-x-auto hide-scrollbar gap-4 py-4 px-2 snap-x scroll-smooth">
                        {categories.map((cat, idx) => {
                            const isActive = activeCategory === cat.filterValue;
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => setActiveCategory(cat.filterValue)}
                                    className={`snap-center flex-shrink-0 w-32 h-32 rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md ${isActive ? 'bg-[#f4f8ff] border border-blue-400' : 'bg-[#f8faff] border border-transparent hover:bg-white'} `}
                                >
                                    <div className="mb-3">
                                        <cat.icon
                                            size={32}
                                            color="#0f172a"
                                            fill="#bae6fd"
                                            strokeWidth={1.5}
                                            className="transition-transform duration-300 hover:scale-110"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-800 tracking-tight text-center px-2 leading-tight">
                                        {cat.name.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br /></React.Fragment>)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-200">
                    <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                        <h3 className="text-lg leading-6 font-bold text-slate-900">Your Opportunities</h3>
                    </div>

                    {loading ? (
                        <div className="p-10 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                            <Calendar className="h-16 w-16 text-slate-300 mb-4" />
                            <p className="text-xl font-medium text-slate-700">No events found in this category.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-200">
                            {filteredEvents.map((event) => (
                                <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={event._id}>
                                    <div className="px-6 py-6 flex items-center hover:bg-slate-50 transition-colors">
                                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div className="truncate">
                                                <div className="flex text-sm mb-1">
                                                    <p className="font-bold text-indigo-600 truncate text-lg">{event.title}</p>
                                                    <p className="ml-2 flex-shrink-0 flex items-center">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {event.status}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex text-sm text-slate-500 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 opacity-80 gap-4">
                                                    <span className="flex items-center"><Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" /> {new Date(event.startDate).toLocaleDateString()}</span>
                                                    <span className="flex items-center"><MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" /> {event.venue || 'Online'}</span>
                                                    <span className="flex items-center"><Users className="flex-shrink-0 mr-1.5 h-4 w-4" /> {event.eventType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-5 flex-shrink-0 flex gap-2">
                                            <Link to={`/events/${event._id}`} className="text-indigo-600 hover:text-indigo-900 font-medium px-4 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm">
                                                View
                                            </Link>
                                            <Link to={`/organiser/edit-event/${event._id}`} className="text-amber-600 hover:text-amber-900 font-medium px-4 py-2 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors shadow-sm">
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganiserDashboard;
