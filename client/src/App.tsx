import React, { useState } from "react";
import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ChatInterface from "@/pages/ChatInterface";
import MapTest from "@/pages/MapTest";
import SavedTrips from "@/pages/SavedTrips";
import logo from "./assets/logo.png";

function Router() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
        <div className="p-4 flex items-center">
          <Link href="/">
            <div className="flex items-center hover:opacity-90 transition-opacity cursor-pointer">
              <img src={logo} alt="offbeat Logo" className="h-8 w-8" />
              {!sidebarCollapsed && <span className="ml-3 font-bold text-xl text-[#655590]">offbeat</span>}
            </div>
          </Link>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            {sidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        <nav className="mt-6 flex-1">
          <Link href="/">
            <div className="flex items-center px-4 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              {!sidebarCollapsed && <span className="ml-3">New Trip</span>}
            </div>
          </Link>
          
          <Link href="/saved-trips">
            <div className="flex items-center px-4 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              {!sidebarCollapsed && <span className="ml-3">Saved Trips</span>}
            </div>
          </Link>
          
          <Link href="/">
            <div className="flex items-center px-4 py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {!sidebarCollapsed && <span className="ml-3">Guides</span>}
            </div>
          </Link>
        </nav>
        
        <div className="mt-auto mb-4 px-4">
          <div className="flex items-center py-3 text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            {!sidebarCollapsed && <span className="ml-3">Settings</span>}
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Switch>
            <Route path="/" component={ChatInterface} />
            <Route path="/map" component={MapTest} />
            <Route path="/saved-trips" component={SavedTrips} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
