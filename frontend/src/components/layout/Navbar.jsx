import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, User, AlignRight } from 'lucide-react';

const Navbar = () => {
    const location = useLocation(); // Hook to trigger re-renders on route changes
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
