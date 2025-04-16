import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ChatInterface from "@/pages/ChatInterface";
import MapTest from "@/pages/MapTest";
import { LogoFull } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";

// Welcome component for the homepage
function Welcome() {
  return (
    <div className="container mx-auto p-4">
      <header className="py-4 px-6 flex justify-between items-center">
        <LogoFull />
        <nav className="hidden md:flex space-x-6">
          <a href="/map-test" className="text-secondary font-medium hover:text-primary transition-colors">
            Trip Map
          </a>
          <a href="#" className="text-secondary font-medium hover:text-primary transition-colors">
            About Us
          </a>
          <a href="#" className="text-secondary font-medium hover:text-primary transition-colors">
            Contact
          </a>
        </nav>
      </header>

      <main>
        <div className="welcome-container">
          <h1 className="welcome-title">Let's find your next offbeat adventure</h1>
          <p className="welcome-subtitle">Travel like a local, powered by guides</p>
          
          <Link href="/chat">
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg shadow-md">
              Start Planning
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-secondary">Personalized Itineraries</h3>
            <p className="text-gray-600">Tell us your interests, and we'll craft a custom adventure just for you.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-secondary">Local Expertise</h3>
            <p className="text-gray-600">Discover hidden gems and authentic experiences recommended by local guides.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-secondary">Interactive Maps</h3>
            <p className="text-gray-600">Visualize your journey with detailed interactive maps and activity routes.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <div className="h-screen flex flex-col">
      <Switch>
        <Route path="/" component={Welcome} />
        <Route path="/chat" component={ChatInterface} />
        <Route path="/map-test" component={MapTest} />
        <Route component={NotFound} />
      </Switch>
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
