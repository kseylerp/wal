import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ChatInterface from "@/pages/ChatInterface";
import MapTest from "@/pages/MapTest";

function Router() {
  return (
    <div className="h-screen flex flex-col">
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
