import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import AIAssistantWidget from "../components/ai/AIAssistantWidget";

export function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        role="student"
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Navbar */}
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        {/* Page Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Floating Agentic AI Assistant */}
      <AIAssistantWidget />
    </div>
  );
}

export default StudentLayout;