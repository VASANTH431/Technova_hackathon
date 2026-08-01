import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, User, Clock, FileText, Upload, Download, CheckCircle, AlertCircle } from 'lucide-react';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Registration state
    const [teamName, setTeamName] = useState('');
    const [pptFile, setPptFile] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login/user');

                const res = await axios.get(`http://localhost:5000/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setEvent(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistering(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/registrations/${id}/register`,
                { teamName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Successfully registered for the event!');
            setTeamName('');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setRegistering(false);
        }
    };

    const handlePptSubmit = async (e) => {
        e.preventDefault();
        if (!pptFile) return setError('Please select a file to upload');

        setRegistering(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('pptSubmission', pptFile);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/registrations/${id}/submit`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setSuccess('PPT successfully submitted!');
            setPptFile(null);
        } catch (err) {
            setError(err.response?.data?.error || 'PPT submission failed');
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen pt-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
        </div>
    );

    if (!event) return (
        <div className="min-h-screen pt-32 text-center">
            <h1 className="text-2xl text-slate-600">Event not found.</h1>
            <Link to="/user-dashboard" className="text-indigo-600 underline mt-4 inline-block">Back to Dashboard</Link>
        </div>
    );

    const isRegistrationOpen = event.registrationEnd ? new Date() < new Date(event.registrationEnd) : true;
    const isSubmissionOpen = event.submissionDeadline ? new Date() < new Date(event.submissionDeadline) : true;

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-16">
            {/* Banner Section */}
            <div className="w-full bg-gradient-to-r from-slate-900 to-indigo-900 min-h-[16rem] md:min-h-[22rem] py-16 pb-24 relative flex items-center justify-center">
                {event.bannerImage && (
                    <img src={`http://localhost:5000${event.bannerImage}`} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" alt="Event Banner" />
                )}
                <div className="relative z-10 text-center px-4 lg:px-8 max-w-5xl mx-auto flex flex-col items-center">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block shadow-lg">
                        {event.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">{event.title}</h1>
                    <p className="text-lg md:text-xl text-indigo-100 drop-shadow-sm max-w-3xl line-clamp-3 md:line-clamp-4">{event.shortDescription}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6">About the Opportunity</h2>
                            <div className="prose prose-indigo max-w-none text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">
                                {event.detailedDescription || event.shortDescription}
                            </div>
                        </div>

                        {event.pptRequired && (
                            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                                <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6 flex items-center">
                                    <FileText className="mr-2 h-6 w-6 text-indigo-600" /> Deliverables
                                </h2>
                                <p className="text-slate-600 mb-6">This event requires a presentation submission. You must download the provided template, fill it out, and upload your finalized PPT before the deadline.</p>

                                {event.pptTemplateUrl ? (
                                    <a
                                        href={`http://localhost:5000${event.pptTemplateUrl}`}
                                        target="_blank" rel="noreferrer"
                                        className="inline-flex items-center px-6 py-3 bg-amber-100 text-amber-800 font-bold rounded-xl border border-amber-200 hover:bg-amber-200 transition-colors shadow-sm"
                                    >
                                        <Download className="mr-2 h-5 w-5" /> Download PPT Template
                                    </a>
                                ) : (
                                    <span className="text-sm text-slate-400 italic">No template provided by the organiser.</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Meta & Actions */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">Key Details</h3>

                            <ul className="space-y-5">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1"><Calendar className="h-6 w-6 text-indigo-500" /></div>
                                    <div className="ml-4">
                                        <p className="text-sm font-semibold text-slate-900">Event Date</p>
                                        <p className="text-sm text-slate-600">{new Date(event.startDate).toLocaleString()}</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1"><MapPin className="h-6 w-6 text-indigo-500" /></div>
                                    <div className="ml-4">
                                        <p className="text-sm font-semibold text-slate-900">Venue</p>
                                        <p className="text-sm text-slate-600">{event.venue || 'Online'}</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        {event.eventType === 'Team' ? <Users className="h-6 w-6 text-indigo-500" /> : <User className="h-6 w-6 text-indigo-500" />}
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-semibold text-slate-900">Participation</p>
                                        <p className="text-sm text-slate-600">{event.eventType} Only</p>
                                    </div>
                                </li>
                                {event.registrationEnd && (
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 mt-1"><Clock className="h-6 w-6 text-rose-500" /></div>
                                        <div className="ml-4">
                                            <p className="text-sm font-semibold text-slate-900">Registration Closes</p>
                                            <p className="text-sm text-slate-600 font-medium text-rose-600">{new Date(event.registrationEnd).toLocaleString()}</p>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Status Messages */}
                        {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl font-semibold flex items-center shadow-sm"><AlertCircle className="mr-2 h-5 w-5" /> {error}</div>}
                        {success && <div className="p-4 bg-green-100 text-green-800 rounded-xl font-semibold flex items-center shadow-sm"><CheckCircle className="mr-2 h-5 w-5" /> {success}</div>}

                        {/* Registration Form */}
                        <div className="bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700 text-white">
                            <h3 className="text-2xl font-bold mb-2">Ready to join?</h3>

                            {!isRegistrationOpen ? (
                                <div className="mt-4 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200 font-semibold text-center">
                                    Registration is closed.
                                </div>
                            ) : (
                                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                                    {event.eventType === 'Team' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">Team Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                className="w-full bg-slate-700 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-400 text-white"
                                                placeholder="e.g. Code Ninjas"
                                            />
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={registering}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 mt-4 text-lg"
                                    >
                                        {registering ? 'Processing...' : `Register ${event.eventType === 'Team' ? 'Team' : 'Now'}`}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* PPT Submission Form */}
                        {event.pptRequired && (
                            <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-4">Submit Presentation</h3>

                                {!isSubmissionOpen ? (
                                    <div className="p-4 bg-slate-100 rounded-xl text-slate-500 font-semibold text-center border border-slate-200">
                                        Deadline over. Submissions closed.
                                    </div>
                                ) : (
                                    <form onSubmit={handlePptSubmit} className="space-y-4">
                                        <p className="text-sm text-slate-500">Note: You must register first before submitting.</p>

                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-10 w-10 text-slate-400" />
                                                <div className="flex text-sm text-slate-600 justify-center">
                                                    <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                        <span>Upload a file</span>
                                                        <input type="file" className="sr-only" onChange={(e) => setPptFile(e.target.files[0])} accept=".ppt,.pptx" />
                                                    </label>
                                                </div>
                                                <p className="text-xs text-slate-500">{pptFile ? pptFile.name : "PPT, PPTX required"}</p>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={registering}
                                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow transition-all flex items-center justify-center"
                                        >
                                            <Upload className="mr-2 h-5 w-5" /> Submit Work
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
