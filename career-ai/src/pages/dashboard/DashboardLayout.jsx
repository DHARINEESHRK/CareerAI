import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Topbar from '../../components/dashboard/Topbar';
import Chatbot from '../../components/dashboard/Chatbot';
import { DashboardProvider } from '../../context/DashboardContext';

const DashboardLayout = () => {
  return (
    <DashboardProvider>
      <div className="flex h-screen w-full bg-[#020617] text-slate-100 font-sans overflow-hidden">
        
        {/* Background Subtle Gradient Glows (Persist through dashboard) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-900/10 blur-[100px]"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/10 blur-[120px]"></div>
        </div>

        {/* Sidebar Component */}
        <Sidebar className="z-40 relative" />

        {/* Main Dashboard Content wrapper */}
        <div className="flex-1 min-w-0 flex flex-col md:ml-64 relative z-10 h-screen overflow-hidden">
          <Topbar />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
            {/* The Outlet renders nested routes (Path, Tasks, GeneratePath) */}
            <div className="max-w-6xl mx-auto w-full overflow-x-hidden">
              <Outlet />
            </div>
          </main>

          {/* Floating AI Chatbot */}
          <Chatbot />
        </div>

      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
