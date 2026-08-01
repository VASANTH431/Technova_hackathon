import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Calendar, MapPin, Users, Trophy, Code, AlarmClock, GraduationCap, PenTool, Mic, Sparkles, ChevronRight, Award, ArrowLeft, User, Download, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const EventListItem = ({ event, onUpdateEvent }) => {
    const [expanded, setExpanded] = useState(false);
    const [registrants, setRegistrants] = useState([]);
    const [loadingRegs, setLoadingRegs] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [certStats, setCertStats] = useState(null);
    const [completingEvent, setCompletingEvent] = useState(false);

    useEffect(() => {
        if (expanded && event.status === 'Completed' && event.certificateConfig?.enabled) {
            fetchCertStats();
        }
    }, [expanded, event.status]);

    const fetchCertStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/certificates/status/${event._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCertStats(res.data);
        } catch (error) {
            console.error("Failed to fetch certificate stats.");
        }
    };

    const markEventCompleted = async () => {
        setCompletingEvent(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/events/${event._id}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowConfirmModal(false);

            // Notify parent to update local events list
            if (onUpdateEvent) onUpdateEvent(res.data.event);

            alert('✅ Event marked as Completed successfully.');

            // Trigger automatic certificate generation immediately after
            if (event.certificateConfig?.enabled) {
                await autoGenerateCertificates();
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to complete event');
        } finally {
            setCompletingEvent(false);
        }
    };

    const autoGenerateCertificates = async () => {
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/certificates/generate/${event._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Certificates generation completed. ${res.data.message}`);
            fetchCertStats();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to generate certificates automatically');
        } finally {
            setGenerating(false);
        }
    };

    const updateEligibility = async (regId, field, value) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/registrations/${regId}/eligibility`, { [field]: value }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRegistrants(registrants.map(r => r._id === regId ? { ...r, [field]: value } : r));
        } catch (err) {
            alert('Failed to update participant eligibility');
        }
    };

    const handleGenerateCertificates = async () => {
        if (!confirm('Are you sure you want to generate certificates for all eligible participants?')) return;
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/certificates/generate/${event._id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to generate certificates');
        } finally {
            setGenerating(false);
        }
    };

    const toggleRegistrations = async () => {
        if (expanded) {
            setExpanded(false);
            setShowConfirmModal(false);
            return;
        }

        setExpanded(true);
        if (registrants.length === 0) {
            setLoadingRegs(true);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/registrations/event/${event._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRegistrants(res.data);
            } catch (err) {
                console.error("Failed to fetch registrations", err);
            } finally {
                setLoadingRegs(false);
            }
        }
    };

    return (
        <motion.li initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col border-b border-slate-200 last:border-0 hover:bg-slate-50 transition-colors">
            <div className="px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="truncate">
                        <div className="flex text-sm mb-1">
                            <p className="font-bold text-indigo-600 truncate text-lg">{event.title}</p>
                            <p className="ml-2 flex-shrink-0 flex items-center">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${event.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {event.status}
                                </span>
                            </p>
                        </div>
                        <div className="mt-2 flex text-sm text-slate-500 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4 sm:mt-0 opacity-80 gap-4">
                            <span className="flex items-center"><Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" /> {new Date(event.startDate).toLocaleDateString()}</span>
                            <span className="flex items-center"><MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" /> {event.venue || 'Online'}</span>
                            <span className="flex items-center"><Users className="flex-shrink-0 mr-1.5 h-4 w-4" /> {event.eventType}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 sm:mt-0 ml-0 sm:ml-5 flex-shrink-0 flex gap-2">
                    <button onClick={toggleRegistrations} className="text-emerald-700 hover:text-emerald-900 font-medium px-4 py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm flex items-center border border-emerald-200">
                        <Users className="h-4 w-4 mr-2" /> {expanded ? "Hide Registrants" : "View Registrants"}
                    </button>
                    <Link to={`/events/${event._id}`} className="text-indigo-600 hover:text-indigo-900 font-medium px-4 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-200">
                        View Page
                    </Link>
                    {event.status === 'Ongoing' && (
                        <button onClick={() => setShowConfirmModal(true)} className="text-emerald-700 hover:text-emerald-900 font-medium px-4 py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm flex items-center border border-emerald-200 shadow-xl">
                            <CheckCircle className="h-4 w-4 mr-2" /> Mark as Completed
                        </button>
                    )}
                </div>
            </div>

            {showConfirmModal && (
                <div className="px-6 py-4 bg-slate-100 border-t border-slate-200">
                    <div className="max-w-xl bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mx-auto">
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Complete Event</h4>
                        <p className="text-slate-600 mb-4">Are you sure you want to mark this event as completed? After completing the event, certificate generation will begin automatically for all eligible participants. This action cannot be easily undone.</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button onClick={markEventCompleted} disabled={completingEvent} className="flex-1 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center">
                                {completingEvent ? 'Processing...' : 'Yes, Complete Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {expanded && (
                <div className="px-6 pb-6 bg-slate-50/50">
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-inner">
                        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-sm md:text-base flex-wrap gap-4">
                            <h4 className="font-bold text-slate-700">Registrations ({registrants.length})</h4>

                            {event.status === 'Completed' && event.certificateConfig?.enabled && certStats && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-semibold text-slate-600 border border-slate-300 rounded-xl px-4 py-2 bg-white shadow-sm flex-1">
                                    <span className="flex items-center gap-1"><Users className="h-4 w-4 text-indigo-500" /> Eligible: {certStats.totalEligible}</span>
                                    <span className="flex items-center gap-1"><Award className="h-4 w-4 text-emerald-500" /> Generated: {certStats.generatedCount}</span>
                                    <span className="flex items-center gap-1"><AlarmClock className="h-4 w-4 text-amber-500" /> Pending: {certStats.pendingCount}</span>
                                    <span className="flex items-center gap-1"><XCircle className="h-4 w-4 text-red-500" /> Failed: {certStats.failedCount}</span>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {event.certificateConfig?.enabled && (
                                    <button onClick={handleGenerateCertificates} disabled={generating || (event.status !== 'Completed')} className={`text-sm font-bold text-white px-4 py-1.5 rounded-md shadow-sm transition-colors flex items-center ${event.status === 'Completed' && !generating ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed'}`}>
                                        <Award className="h-4 w-4 mr-2" />
                                        {generating ? 'Processing...' : 'Generate Certificates'}
                                    </button>
                                )}

                                {event.status === 'Completed' && event.certificateConfig?.enabled && (
                                    <a href={`http://localhost:5000/api/certificates/download-all/${event._id}?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" className="text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-md shadow-sm transition-colors flex items-center">
                                        <Download className="h-4 w-4 mr-2" />
                                        ZIP All
                                    </a>
                                )}
                            </div>
                        </div>
                        {loadingRegs ? (
                            <div className="p-8 text-center text-slate-500">Loading registrants...</div>
                        ) : registrants.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">No one has registered for this opportunity yet.</div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {registrants.map(reg => (
                                    <li key={reg._id} className="p-4 hover:bg-slate-50 flex justify-between items-center">
                                        <div className="flex-1 pr-4">
                                            <p className="font-bold text-slate-800 flex items-center gap-2">
                                                {event.eventType === 'Team' ? (
                                                    <><Users className="h-4 w-4 text-indigo-500" /> {reg.teamName || 'Untitled Team'}</>
                                                ) : (
                                                    <><User className="h-4 w-4 text-indigo-500" /> {reg.user?.name || 'Unknown'}</>
                                                )}
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                                Registered on {new Date(reg.createdAt).toLocaleDateString()}
                                                {event.eventType === 'Team' && <span className="ml-2 px-2 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-600 border border-slate-200">Leader: {reg.user?.name || 'Unknown'}</span>}
                                            </p>

                                            {event.eventType === 'Team' && reg.teamMembers && reg.teamMembers.length > 0 && (
                                                <div className="mt-3 bg-white border border-slate-200 rounded-lg p-3 shadow-inner">
                                                    <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Team Roster</p>
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {reg.teamMembers.map((member, idx) => (
                                                            <li key={idx} className="flex items-center text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-md p-2 shadow-sm">
                                                                <User className="h-3 w-3 text-indigo-400 mr-2 shrink-0" />
                                                                <span className="font-semibold truncate max-w-[45%]">{member.name || 'Unnamed'}</span>
                                                                <span className="text-slate-400 ml-1 text-xs truncate">- {member.email || 'No email'}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 items-end">
                                            {reg.pptSubmissionUrl ? (
                                                <a href={`http://localhost:5000${reg.pptSubmissionUrl}`} target="_blank" rel="noreferrer" className="flex items-center text-sm px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-bold transition-colors border border-blue-200 w-full justify-center">
                                                    <Download className="h-4 w-4 mr-1.5" /> Download PPT
                                                </a>
                                            ) : event.pptRequired ? (
                                                <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200 text-center w-full block mb-1">Pending PPT</span>
                                            ) : null}

                                            {event.certificateConfig?.enabled && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateEligibility(reg._id, 'attendanceVerified', !reg.attendanceVerified)} className={`text-xs px-2 py-1 rounded font-bold border transition-colors flex items-center ${reg.attendanceVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                        <CheckCircle className="h-3 w-3 mr-1" /> Attendance
                                                    </button>
                                                    <button onClick={() => updateEligibility(reg._id, 'certificateEligible', !reg.certificateEligible)} className={`text-xs px-2 py-1 rounded font-bold border transition-colors flex items-center ${reg.certificateEligible ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                        <Award className="h-3 w-3 mr-1" /> Eligible
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </motion.li>
    );
};

const OrganiserDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const navigate = useNavigate();

    const updateLocalEvent = (updatedEvent) => {
        setEvents(prev => prev.map(e => e._id === updatedEvent._id ? updatedEvent : e));
    };

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
                                <EventListItem key={event._id} event={event} onUpdateEvent={updateLocalEvent} />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganiserDashboard;
