import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ChatInterface from "@/pages/ChatInterface";
import MapTest from "@/pages/MapTest";

function Router() {
  return (
    <div>
      <nav className="bg-primary/20 py-2 mb-4">
        <div className="container mx-auto flex gap-4 px-4">
          <Link href="/">
            <span className="text-primary hover:underline cursor-pointer">Chat</span>
          </Link>
          <Link href="/map-test">
            <span className="text-primary hover:underline cursor-pointer">Map Test</span>
          </Link>
        </div>
      </nav>
      
      <Switch>
        <Route path="/" component={ChatInterface} />
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
