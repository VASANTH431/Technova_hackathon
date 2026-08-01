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
                    <div className="h-40 bg-slate-100 relative overflow-hidden group-hover:opacity-90 transition-opacity flex items-center justify-center">
                        {cert.event.certificateConfig?.templateUrl ? (
                            <img src={`http://localhost:5000${cert.event.certificateConfig.templateUrl}`} className="w-full h-full object-cover opacity-90 mix-blend-multiply" alt="Certificate Background" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>

                    <div className="px-6 pb-6 relative">
                        <div className="absolute -top-12 left-6 h-24 w-24 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-slate-50 overflow-hidden">
                            <img src={cert.qrCodeUrl} alt="QR" className="h-full w-full object-cover mix-blend-multiply scale-110" />
                        </div>

                        <div className="pt-14 ml-0">
                            <div className="flex flex-col gap-1 items-end -mt-16 text-right mb-6 relative z-10 text-white drop-shadow-md">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                    Issued
                                </p>
                                <p className="font-semibold text-sm">
                                    {new Date(cert.issueDate).toLocaleDateString()}
                                </p>
                            </div>

                            <h4 className="text-2xl font-bold text-slate-800 line-clamp-2 mt-4">{cert.event.title}</h4>
                            <p className="text-sm font-semibold text-indigo-600 mt-1 flex items-center">
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
