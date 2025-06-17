import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

   return (
      <div className="flex h-screen bg-[#172B4C] text-white">
         <Sidebar isOpen={isSidebarOpen} />
         <div
            className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
               isSidebarOpen ? "ml-64" : "ml-16"
            }`}
         >
            <Topbar toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
            <main className="flex-1 overflow-y-auto px-10 py-10 bg-[#F9F9FB] text-black">
               {children}
            </main>
         </div>
      </div>
   );
}
