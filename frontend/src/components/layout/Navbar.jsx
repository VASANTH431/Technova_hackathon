import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, User, AlignRight, Bell, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get('http://localhost:5000/api/notifications/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchNotifications();
    }, [location]);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    return (
        <nav className="fixed w-full z-50 top-0 start-0 glass border-b border-white/20 transition-all duration-300 py-3">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Calendar size={22} />
                    </div>
                    <span className="self-center text-xl font-bold whitespace-nowrap text-slate-800">
                        UnifyEvents
                    </span>
                </Link>
                <div className="flex md:order-2 space-x-3 rtl:space-x-reverse">
                    {localStorage.getItem('token') ? (
                        <>
                            <div className="relative">
                                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors relative">
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                                <h3 className="font-bold text-slate-700 text-sm">Notifications</h3>
                                                <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center text-slate-500 text-sm">No notifications yet.</div>
                                                ) : (
                                                    <ul className="divide-y divide-slate-50">
                                                        {notifications.map(notif => (
                                                            <li key={notif._id} className={`p-4 transition-colors hover:bg-slate-50 ${!notif.read ? 'bg-indigo-50/50' : ''}`}>
                                                                <div className="flex gap-3">
                                                                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                        <CheckCircle size={14} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`text-sm font-semibold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</p>
                                                                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-snug">{notif.message}</p>

                                                                        <div className="mt-2 flex items-center justify-between">
                                                                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                                            </span>

                                                                            {!notif.read && (
                                                                                <button onClick={() => markAsRead(notif._id)} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">Mark read</button>
                                                                            )}
                                                                        </div>

                                                                        {notif.actionUrl && (
                                                                            <Link to={notif.actionUrl} onClick={() => { markAsRead(notif._id); setShowNotifications(false); }} className="mt-2 inline-flex text-xs bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 font-bold px-3 py-1.5 rounded-lg transition-colors w-full justify-center shadow-sm">
                                                                                View Details
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Link to="/profile" className="text-slate-600 hover:text-blue-600 font-medium px-4 py-2 transition-colors flex items-center gap-1">
                                <User size={18} /> Profile
                            </Link>
                            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="text-white bg-slate-800 hover:bg-slate-900 font-medium rounded-full text-sm px-5 py-2 transition-all shadow-md">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/signup" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2 text-center transition-all shadow-md shadow-blue-500/30">
                            Sign Up
                        </Link>
                    )}
                    <button data-collapse-toggle="navbar-sticky" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-slate-500 rounded-lg md:hidden hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200">
                        <span className="sr-only">Open main menu</span>
                        <AlignRight size={24} />
                    </button>
                </div>
                <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-slate-100 rounded-lg bg-slate-50/50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
                        <li>
                            <Link to="/" className="block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0" aria-current="page">Home</Link>
                        </li>
                        <li>
                            <Link to="/events" className="block py-2 px-3 text-slate-900 rounded hover:bg-slate-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 transition-colors">All Events</Link>
                        </li>
                        <li>
                            <Link to="/opportunities" className="block py-2 px-3 text-slate-900 rounded hover:bg-slate-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 transition-colors">Opportunities</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
