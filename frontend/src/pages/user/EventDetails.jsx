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
    const [isRegistered, setIsRegistered] = useState(false);
    const [userRegistration, setUserRegistration] = useState(null);

    // Registration state
    const [teamName, setTeamName] = useState('');
    const [teamMembers, setTeamMembers] = useState([{ name: '', email: '' }]); // Allow dynamic members if needed
    const [pptFile, setPptFile] = useState(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return navigate('/login/user');

                const res = await axios.get(`http://localhost:5000/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Also check if user is already registered
                try {
                    const regRes = await axios.get('http://localhost:5000/api/registrations/my', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const existingReg = regRes.data.find(r => r.event._id === id || r.event === id);
                    if (existingReg) {
                        setIsRegistered(true);
                        setUserRegistration(existingReg);
                    }
                } catch (regErr) {
                    console.error("Failed to check registration status", regErr);
                }

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

        if (event.pptRequired && !pptFile) {
            setError('Please upload your PPT submission');
            setRegistering(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const submitData = new FormData();

            if (event.eventType === 'Team') {
                submitData.append('teamName', teamName);
                submitData.append('teamMembers', JSON.stringify(teamMembers));
            }
            if (pptFile) {
                submitData.append('pptSubmission', pptFile);
            }

            await axios.post(`http://localhost:5000/api/registrations/${id}/register`, submitData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Successfully registered and submitted!');
            setTeamName('');
            setTeamMembers([{ name: '', email: '' }]);
            setPptFile(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
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

                        {/* Registration Form OR Registered Status */}
                        <div className={`rounded-3xl shadow-2xl p-8 border ${isRegistered ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-700 text-white' : 'bg-slate-800 border-slate-700 text-white'}`}>

                            {isRegistered ? (
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-white">You're All Set!</h3>
                                    <p className="text-indigo-200 mb-6 font-medium">You are securely registered for this event.</p>

                                    <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10 mb-6 text-left space-y-4">
                                        <h4 className="font-bold text-indigo-300 text-sm tracking-wider uppercase mb-1">Your Schedule</h4>
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 text-indigo-400 mr-3 shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">Event Date</p>
                                                <p className="text-sm text-indigo-200">{new Date(event.startDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {event.submissionDeadline && (
                                            <div className="flex items-center">
                                                <Clock className="h-5 w-5 text-rose-400 mr-3 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-semibold text-white">Submission Deadline</p>
                                                    <p className="text-sm text-rose-200">{new Date(event.submissionDeadline).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Link to="/user-dashboard" className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all text-sm">
                                        Go to Dashboard
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-bold mb-2">Ready to join?</h3>

                                    {!isRegistrationOpen ? (
                                        <div className="mt-4 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-200 font-semibold text-center">
                                            Registration is closed.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleRegister} className="mt-6 space-y-4">
                                            {event.eventType === 'Team' && (
                                                <div className="space-y-4">
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

                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <label className="block text-sm font-medium text-slate-300">Team Members</label>
                                                            <button type="button" onClick={() => setTeamMembers([...teamMembers, { name: '', email: '' }])} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 px-2 py-1 rounded-md">+ Add Member</button>
                                                        </div>
                                                        {teamMembers.map((member, idx) => (
                                                            <div key={idx} className="flex gap-2 items-center">
                                                                <input
                                                                    type="text" required placeholder="Full Name"
                                                                    value={member.name}
                                                                    onChange={e => { const newM = [...teamMembers]; newM[idx].name = e.target.value; setTeamMembers(newM); }}
                                                                    className="w-1/2 bg-slate-700 border-none rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-400 text-white text-sm"
                                                                />
                                                                <input
                                                                    type="email" required placeholder="Email Address"
                                                                    value={member.email}
                                                                    onChange={e => { const newM = [...teamMembers]; newM[idx].email = e.target.value; setTeamMembers(newM); }}
                                                                    className="w-1/2 bg-slate-700 border-none rounded-xl py-2 px-3 focus:ring-2 focus:ring-indigo-400 text-white text-sm"
                                                                />
                                                                {teamMembers.length > 1 && (
                                                                    <button type="button" onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== idx))} className="text-rose-400 hover:text-rose-300 ml-1 font-bold shrink-0" title="Remove">✕</button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {event.pptRequired && (
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-slate-300 mb-2">Upload PPT Submission</label>
                                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-xl bg-slate-700/50 hover:bg-slate-700 transition-colors">
                                                        <div className="space-y-1 text-center">
                                                            <Upload className="mx-auto h-10 w-10 text-slate-400" />
                                                            <div className="flex text-sm text-slate-300 justify-center">
                                                                <label className="relative cursor-pointer rounded-md font-medium text-indigo-400 hover:text-indigo-300">
                                                                    <span>Upload a file</span>
                                                                    <input type="file" required={event.pptRequired} className="sr-only" onChange={(e) => setPptFile(e.target.files[0])} accept=".ppt,.pptx" />
                                                                </label>
                                                            </div>
                                                            <p className="text-xs text-slate-500">{pptFile ? pptFile.name : "PPT, PPTX required"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={registering}
                                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 mt-6 text-lg"
                                            >
                                                {registering ? 'Processing...' : `Register ${event.eventType === 'Team' ? 'Team' : 'Now'}`}
                                            </button>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
