import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Download, DownloadCloud, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const MyCertificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/certificates/my', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCertificates(res.data);
            } catch (err) {
                console.error('Failed to fetch certificates:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    if (loading) {
        return <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div></div>;
    }

    if (certificates.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 flex flex-col items-center">
                <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Award className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Certificates Yet</h3>
                <p className="text-slate-500 max-w-sm">Participate in events and hackathons to earn verified digital credentials!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {certificates.map((cert) => (
                <motion.div key={cert._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">
                    <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute -bottom-10 -right-10 opacity-20 transform group-hover:scale-125 transition-transform duration-700">
                            <Award size={120} />
                        </div>
                    </div>

                    <div className="px-6 pb-6 relative">
                        <div className="absolute -top-10 left-6 h-20 w-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-slate-50">
                            <img src={cert.qrCodeUrl} alt="QR" className="h-16 w-16" />
                        </div>

                        <div className="mt-14">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center">
                                Issued: {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                            <h4 className="text-xl font-bold text-slate-800 line-clamp-2">{cert.event.title}</h4>
                            <p className="text-sm text-slate-500 mt-1 flex items-center">
                                By {cert.event.organiserName || 'Organizer'}
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex gap-3">
                            <a href={`http://localhost:5000${cert.pdfUrl}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-colors text-sm border border-indigo-100 flex items-center justify-center gap-2 shadow-sm">
                                <Eye className="h-4 w-4" /> View
                            </a>
                            <a href={`http://localhost:5000${cert.pdfUrl}`} download className="flex-1 text-center py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-md">
                                <DownloadCloud className="h-4 w-4" /> Save PDF
                            </a>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default MyCertificates;
