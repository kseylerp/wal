import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import NotFound from "@/pages/not-found";
import ChatInterface from "@/pages/ChatInterface";
import MapTest from "@/pages/MapTest";
import SavedTrips from "@/pages/SavedTrips";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import SharedTripPage from "@/pages/SharedTripPage";
import ActivityDemo from "@/pages/ActivityDemo";
import logo from "./assets/new-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { User, LogOut } from "lucide-react";

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b py-2 px-4 flex items-center">
      <div className="flex items-center">
        <Link href="/">
          <div className="flex items-center hover:opacity-90 transition-opacity cursor-pointer">
            <img src={logo} alt="offbeat Logo" className="h-[50px]" />
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
        <Link href="/activity-demo">
          <div className="mx-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer">
            Activity Demo
          </div>
        </Link>
        
        {user ? (
          <>
            <Link href="/profile">
              <div className="mx-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer flex items-center">
                <User className="h-4 w-4 mr-1" />
                {user.username}
              </div>
            </Link>
            <div 
              onClick={() => logout()}
              className="mx-2 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </div>
          </>
        ) : (
          <Link href="/auth">
            <div className="mx-2 px-3 py-1.5 rounded bg-primary hover:bg-primary/90 text-white transition-colors cursor-pointer">
              Login
            </div>
          </Link>
        )}
      </nav>
    </header>
  );
}

function Router() {
  return (
    <div className="h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={ChatInterface} />
          <Route path="/map" component={MapTest} />
          <Route path="/saved-trips" component={SavedTrips} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/trips/shared/:shareableId" component={SharedTripPage} />
          <Route path="/activity-demo" component={ActivityDemo} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
