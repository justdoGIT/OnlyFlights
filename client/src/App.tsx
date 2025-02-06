import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatWidget } from "@/components/chat-widget";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Flights from "@/pages/flights";
import Hotels from "@/pages/hotels";
import Packages from "@/pages/packages";
import Contact from "@/pages/contact";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/flights" component={Flights} />
      <Route path="/hotels" component={Hotels} />
      <Route path="/packages" component={Packages} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
        <ChatWidget />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
