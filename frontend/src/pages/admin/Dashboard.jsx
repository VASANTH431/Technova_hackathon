import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Trash2, Calendar, Edit, Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen bg-rose-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-rose-200">
                    <div className="flex items-center">
                        <div className="bg-rose-600 p-3 rounded-2xl shadow-lg mr-4">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Admin Console</h1>
                            <p className="mt-1 text-rose-600 font-medium flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-1" /> Elevated Privileges Active
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-rose-100">
                    <div className="px-6 py-5 border-b border-rose-100 bg-rose-50/50 flex justify-between items-center">
                        <h3 className="text-lg leading-6 font-bold text-slate-900 flex items-center"><Calendar className="mr-2 text-rose-500" /> Platform Events Directory</h3>
                        <span className="bg-rose-100 text-rose-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">{events.length} Total</span>
                    </div>

                    {loading ? (
                        <div className="p-20 flex justify-center text-rose-500">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <p className="text-lg font-medium">No events currently exist on the platform.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Event Information</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {events.map((event) => (
                                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={event._id} className="hover:bg-rose-50/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">{event.title}</div>
                                                        <div className="text-sm text-slate-500">{event.category} - {event.eventType}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 inline-flex text-xs leading-5 font-bold rounded-full ${event.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                {new Date(event.startDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => navigate(`/events/${event._id}`)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors" title="View">
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    {/* In a complete app, we'd route to an edit form here */}
                                                    <button onClick={() => alert('Editing functionalities are restricted in this demo view, but Admin overrides exist in API.')} className="text-amber-600 hover:text-amber-900 bg-amber-50 p-2 rounded-lg hover:bg-amber-100 transition-colors" title="Edit">
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(event._id)} className="text-rose-600 hover:text-rose-900 bg-rose-50 p-2 rounded-lg hover:bg-rose-100 transition-colors" title="Delete">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
