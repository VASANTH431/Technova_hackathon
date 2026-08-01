import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Upload, ArrowRight, Save, Info, Users, Clock, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("REACT BOUNDARY CAUGHT ERROR:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', background: 'red', color: 'white' }}>
                    <h1>Something went wrong.</h1>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const CreateEventComponent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        category: 'Conference',
        eventType: 'Solo',
        topic: '',
        shortDescription: '',
        detailedDescription: '',
        venue: '',
        startDate: '',
        endDate: '',
        registrationEnd: '',
        submissionDeadline: '',
        pptRequired: false,
        status: 'Published'
    });

    const [files, setFiles] = useState({
        bannerImage: null,
        pptTemplate: null
    });

    const categories = ['Conference', 'Hackathon', 'Competition', 'Meeting', 'Job Offer', 'Online Event', 'Internship'];

    useEffect(() => {
        if (isEditMode) {
            const fetchEvent = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:5000/api/events/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const event = res.data;
                    const formatDate = (dateStr) => {
                        if (!dateStr) return '';
                        return new Date(dateStr).toISOString().slice(0, 16);
                    };

                    setFormData({
                        title: event.title || '',
                        category: event.category || 'Conference',
                        eventType: event.eventType || 'Solo',
                        topic: event.topic || '',
                        shortDescription: event.shortDescription || '',
                        detailedDescription: event.detailedDescription || '',
                        venue: event.venue || '',
                        startDate: formatDate(event.startDate),
                        endDate: formatDate(event.endDate),
                        registrationEnd: formatDate(event.registrationEnd),
                        submissionDeadline: formatDate(event.submissionDeadline),
                        pptRequired: event.pptRequired || false,
                        status: event.status || 'Published'
                    });
                } catch (err) {
                    setError('Failed to fetch event data for editing.');
                }
            };
            fetchEvent();
        }
    }, [id, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleFileChange = (e) => {
        setFiles({
            ...files,
            [e.target.name]: e.target.files[0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) return navigate('/login/organiser');

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });

        if (files.bannerImage) submitData.append('bannerImage', files.bannerImage);
        if (formData.pptRequired && files.pptTemplate) {
            submitData.append('pptTemplate', files.pptTemplate);
        }

        try {
            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/events/${id}`, submitData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post('http://localhost:5000/api/events', submitData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            setLoading(false);
            navigate('/organiser-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create event');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 sm:p-12 text-white">
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2">{isEditMode ? 'Edit Opportunity' : 'Create New Opportunity'}</h1>
                        <p className="text-indigo-100 text-lg">{isEditMode ? 'Update your opportunity details directly.' : 'Launch your event to millions of students & professionals globally.'}</p>
                    </div>

                    {error && (
                        <div className="mx-8 mt-8 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 sm:p-12">
                        {/* Step 1: Basic Details */}
                        <div className={`space-y-8 ${step !== 1 ? 'hidden' : ''}`}>
                            <div className="border-b border-slate-200 pb-2 mb-6">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Info className="text-indigo-500" /> Core Information</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Opportunity Title <span className="text-red-500">*</span></label>
                                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full form-input rounded-xl border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 text-lg py-3 shadow-sm" placeholder="e.g. Global Tech Hackathon 2026" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category <span className="text-red-500">*</span></label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 focus:ring-indigo-500 py-3 shadow-sm bg-slate-50 font-medium text-slate-700">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Topic / Domain</label>
                                    <input type="text" name="topic" value={formData.topic} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 focus:ring-indigo-500 py-3 shadow-sm bg-slate-50" placeholder="e.g. Artificial Intelligence" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description <span className="text-red-500">*</span></label>
                                <textarea name="shortDescription" required value={formData.shortDescription} onChange={handleInputChange} rows={2} className="w-full rounded-xl border-slate-300 focus:ring-indigo-500 shadow-sm" placeholder="A catchy tagline for your opportunity..." />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Participation Type <span className="text-red-500">*</span></label>
                                <div className="flex gap-4">
                                    {['Solo', 'Team'].map(type => (
                                        <label key={type} className={`flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.eventType === type ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 hover:border-indigo-300 text-slate-600'}`}>
                                            <input type="radio" name="eventType" value={type} checked={formData.eventType === type} onChange={handleInputChange} className="sr-only" />
                                            {type === 'Team' ? <Users className="mr-2 h-5 w-5" /> : <div className="mr-2 h-5 w-5 bg-slate-300 rounded-full" />}
                                            {type} Participation
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Timeline & Venue */}
                        <div className={`space-y-8 ${step !== 2 ? 'hidden' : ''}`}>
                            <div className="border-b border-slate-200 pb-2 mb-6">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><CalendarDays className="text-indigo-500" /> Timeline & Location</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date & Time <span className="text-red-500">*</span></label>
                                    <input type="datetime-local" name="startDate" required value={formData.startDate} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 focus:ring-indigo-500 py-3 shadow-sm bg-slate-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Date & Time <span className="text-red-500">*</span></label>
                                    <input type="datetime-local" name="endDate" required value={formData.endDate} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 focus:ring-indigo-500 py-3 shadow-sm bg-slate-50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Deadline <span className="text-red-500">*</span></label>
                                    <input type="datetime-local" name="registrationEnd" required value={formData.registrationEnd} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 focus:ring-indigo-500 py-3 shadow-sm bg-slate-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Venue (Leave blank if Online)</label>
                                    <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 focus:ring-indigo-500 py-3 shadow-sm bg-slate-50" placeholder="e.g. Main Auditorium" />
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Requirements & Media */}
                        <div className={`space-y-8 ${step !== 3 ? 'hidden' : ''}`}>
                            <div className="border-b border-slate-200 pb-2 mb-6">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Upload className="text-indigo-500" /> Requirements & Assets</h3>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" name="pptRequired" checked={formData.pptRequired} onChange={handleInputChange} className="form-checkbox h-6 w-6 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 transition duration-150 ease-in-out" />
                                    <span className="text-slate-800 font-bold text-lg">Does this event require a PPT Submission?</span>
                                </label>

                                <AnimatePresence>
                                    {formData.pptRequired && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 space-y-6 overflow-hidden">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Submission Deadline <span className="text-red-500">*</span></label>
                                                <input type="datetime-local" name="submissionDeadline" required={formData.pptRequired} value={formData.submissionDeadline} onChange={handleInputChange} className="w-full rounded-xl border-slate-300 focus:ring-indigo-500 py-3 shadow-sm bg-white" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Upload PPT Template Format (.pptx)</label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-white hover:bg-slate-50 transition-colors">
                                                    <div className="space-y-1 text-center">
                                                        <Upload className="mx-auto h-10 w-10 text-slate-400" />
                                                        <div className="flex text-sm text-slate-600 justify-center">
                                                            <label htmlFor="pptTemplate" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                                <span>Upload a file</span>
                                                                <input id="pptTemplate" name="pptTemplate" type="file" className="sr-only" onChange={handleFileChange} accept=".ppt,.pptx" />
                                                            </label>
                                                        </div>
                                                        <p className="text-xs text-slate-500 text-center">{files.pptTemplate ? files.pptTemplate.name : "PPT, PPTX up to 10MB"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Banner Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-10 w-10 text-slate-400" />
                                        <div className="flex text-sm text-slate-600 justify-center">
                                            <label htmlFor="bannerImage" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                                <span>Upload a banner</span>
                                                <input id="bannerImage" name="bannerImage" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500">{files.bannerImage ? files.bannerImage.name : "PNG, JPG up to 5MB"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(step > 1 ? step - 1 : 1)}
                                className={`px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors ${step === 1 ? 'invisible' : ''}`}
                            >
                                Back
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(step + 1)}
                                    className="px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center shadow-md transition-transform hover:-translate-y-0.5"
                                >
                                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 flex items-center shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (isEditMode ? 'Saving...' : 'Publishing...') : (isEditMode ? 'Save Changes' : 'Publish Event')} <Save className="ml-2 h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const CreateEvent = () => (
    <ErrorBoundary>
        <CreateEventComponent />
    </ErrorBoundary>
);

export default CreateEvent;
