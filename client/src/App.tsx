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
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b py-2 px-4 flex items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center hover:opacity-90 transition-opacity cursor-pointer">
              <img src={logo} alt="offbeat Logo" className="h-10 mr-3" />
              <span className="font-bold text-xl text-gray-700">offbeat</span>
            </div>
          </Link>
        </div>
        <nav className="ml-auto flex items-center">
          <Link href="/">
            <div className="mx-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer">
              Chat
            </div>
          </Link>
          <Link href="/saved-trips">
            <div className="mx-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer">
              Saved Trips
            </div>
          </Link>
        </nav>
      </header>
      <div className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={ChatInterface} />
          <Route path="/map" component={MapTest} />
          <Route path="/saved-trips" component={SavedTrips} />
          <Route component={NotFound} />
        </Switch>
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
