import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Path from './pages/dashboard/Path';
import Tasks from './pages/dashboard/Tasks';
import Progress from './pages/dashboard/Progress';
import GeneratePath from './pages/dashboard/GeneratePath';
import Jobs from './pages/dashboard/Jobs';
import Profile from './pages/dashboard/Profile';
import Notifications from './pages/dashboard/Notifications';
import CompleteProfile from './pages/CompleteProfile';
import { Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';
import { useEffect } from 'react';
import { apiFetch } from './utils/api';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div className="relative z-10 w-full min-h-screen pt-24">
        <Outlet />
      </div>
    </>
  );
};

function App() {
  useEffect(() => {
    const syncAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await apiFetch("http://localhost:5000/api/user/profile");
          if (res && res.ok) {
            const data = await res.json();
            localStorage.setItem("user", JSON.stringify(data));
          }
        } catch (error) {
          console.error("Auth sync failed", error);
        }
      }
    };
    syncAuth();
  }, []);

  return (
    <BrowserRouter>
      <div className="relative min-h-screen w-full bg-[#020617] overflow-x-hidden text-slate-100 font-sans selection:bg-purple-500/30">
        
        {/* Background Animated Gradient Orbs */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse-slow object-right-bottom"></div>
          <div className="absolute top-[30%] left-[40%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[100px] animate-float"></div>
        </div>

        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={localStorage.getItem("token") ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/signup" element={localStorage.getItem("token") ? <Navigate to="/dashboard" replace /> : <Signup />} />
          </Route>
            
            {/* Dashboard Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard/path" replace />} />
                <Route path="path" element={<Path />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="progress" element={<Progress />} />
                <Route path="generate" element={<GeneratePath />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;
