import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ChatInterface from "@/pages/ChatInterface";
import MapTest from "@/pages/MapTest";
import TripPlanner from "@/pages/TripPlanner";
import TripResults from "@/pages/TripResults";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <a className="font-bold text-xl text-primary">AdventureAI</a>
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/">
              <a className="text-gray-700 hover:text-primary">Chat</a>
            </Link>
            <Link href="/trip-planner">
              <a className="text-gray-700 hover:text-primary">Trip Planner</a>
            </Link>
            <Link href="/map-test">
              <a className="text-gray-700 hover:text-primary">Map Test</a>
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={ChatInterface} />
          <Route path="/map-test" component={MapTest} />
          <Route path="/trip-planner" component={TripPlanner} />
          <Route path="/trip-results" component={TripResults} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
        <div className="container mx-auto px-4">
          AdventureAI Trip Planner - Powered by OpenAI and MapBox
        </div>
      </footer>
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
