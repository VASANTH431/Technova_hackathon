import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search, MapPin, User as UserIcon, Briefcase, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="relative min-h-screen pt-24 pb-12 overflow-hidden flex flex-col justify-center">
            {/* Decorative gradient blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mt-10">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm border border-blue-100"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                        <span>Platform officially launched!</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8"
                    >
                        Book your next <span className="text-gradient">Opportunity</span> with UnifyEvents
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Discover conferences, hackathons, job offers, and limitless opportunities. Digitized workflows for organisers, administrators, and you.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="glass-card p-3 rounded-2xl mx-auto max-w-3xl flex flex-col md:flex-row gap-3 relative z-20 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
                    >
                        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
                            <Search className="text-slate-400 mr-3" size={20} />
                            <input
                                type="text"
                                placeholder="Search events, organizers..."
                                className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
                            <MapPin className="text-slate-400 mr-3" size={20} />
                            <input
                                type="text"
                                placeholder="Location or Online"
                                className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-3 font-semibold transition-all shadow-md flex items-center justify-center min-w-[140px]">
                            Explore <ArrowRight size={18} className="ml-2" />
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    <div className="glass-card p-8 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100/50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600 shadow-sm border border-blue-100/50">
                            <UserIcon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Participant Portal</h3>
                        <p className="text-slate-500 mb-6 text-sm">Discover tech events, upload submissions, and manage registrations.</p>
                        <Link to="/login/user" className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                            Login as User <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    <div className="glass-card p-8 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-100/50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600 shadow-sm border border-indigo-100/50">
                            <Briefcase size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Organiser Portal</h3>
                        <p className="text-slate-500 mb-6 text-sm">Publish events, manage attendees, and view analytics directly.</p>
                        <Link to="/login/organiser" className="inline-flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                            Login as Organiser <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    <div className="glass-card p-8 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100/50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 text-rose-500 shadow-sm border border-rose-100/50">
                            <Shield size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Admin Portal</h3>
                        <p className="text-slate-500 mb-6 text-sm">Manage entire platform operations, user approvals & moderation.</p>
                        <Link to="/login/admin" className="inline-flex items-center text-rose-500 font-semibold group-hover:gap-2 transition-all">
                            Login as Admin <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
