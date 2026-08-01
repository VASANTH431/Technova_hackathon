import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, XCircle, Search, Calendar, User, Award, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyCertificate = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/certificates/verify/${id}`);
                setCertificate(res.data);
            } catch (err) {
                setError(err.response?.data?.error || 'Certificate Not Found');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [id]);

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 flex justify-center items-center">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-10">
                    <div className="mx-auto h-20 w-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-6">
                        <Search className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Credential Verification</h1>
                    <p className="text-lg text-slate-500 mt-2 font-medium">Verify authenticity of issued certificates.</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    {loading ? (
                        <div className="p-16 flex flex-col items-center justify-center text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                            <h3 className="text-xl font-bold text-slate-700">Verifying Record...</h3>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center bg-red-50">
                            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                            <h2 className="text-3xl font-bold text-red-700 mb-2">Invalid Certificate</h2>
                            <p className="text-red-500 font-medium">{error}</p>
                            <Link to="/" className="inline-flex mt-8 font-bold text-red-700 hover:text-red-900 bg-red-100 px-6 py-3 rounded-xl transition-colors">
                                Return to Homepage
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-emerald-50 p-8 text-center border-b border-emerald-100">
                                <ShieldCheck className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
                                <h2 className="text-3xl font-extrabold text-emerald-700 mb-2">Verified Authentic</h2>
                                <p className="text-emerald-600 font-medium">This certificate was officially issued and recorded.</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center"><User className="h-4 w-4 mr-2" /> Recipient</p>
                                        <p className="text-lg font-bold text-slate-800">{certificate.participantName}</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center"><Award className="h-4 w-4 mr-2" /> Opportunity</p>
                                        <p className="text-lg font-bold text-slate-800">{certificate.eventName}</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center"><Calendar className="h-4 w-4 mr-2" /> Issue Date</p>
                                        <p className="text-lg font-bold text-slate-800">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center"><ExternalLink className="h-4 w-4 mr-2" /> Issuer</p>
                                        <p className="text-lg font-bold text-slate-800">{certificate.organizerName}</p>
                                    </div>
                                </div>

                                <div className="mt-8 text-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100 border-dashed">
                                    <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-1">Certificate ID</p>
                                    <p className="font-mono text-xl font-bold text-indigo-700 tracking-[0.1em]">{certificate.certificateId}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyCertificate;
