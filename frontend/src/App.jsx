import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import OrganiserDashboard from './pages/organiser/Dashboard';
import CreateEvent from './pages/organiser/CreateEvent';
import UserDashboard from './pages/user/Dashboard';
import EventDetails from './pages/user/EventDetails';
import AdminDashboard from './pages/admin/Dashboard';
import Profile from './pages/user/Profile';
import { useEffect } from 'react';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login/:role" element={<Login />} />
              <Route path="/organiser-dashboard" element={<OrganiserDashboard />} />
              <Route path="/organiser/create-event" element={<CreateEvent />} />
              <Route path="/organiser/edit-event/:id" element={<CreateEvent />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              {/* Additional routes will be added here */}
            </Routes>
          </main>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
