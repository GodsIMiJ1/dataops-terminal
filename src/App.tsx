import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TerminalPage from "./pages/TerminalPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { testEnvVariables } from "./utils/envTest";

const queryClient = new QueryClient();

const App = () => {
  // Test Ollama connection on app load
  useEffect(() => {
    const checkOllama = async () => {
      const result = await testEnvVariables();
      console.log('Ollama connection test result:', result);

      if (!result.ollamaRunning) {
        console.error('WARNING: Ollama is not running! The application will use fallback responses.');
      } else {
        console.log(`Ollama is running with model ${result.ollamaModel}`);
      }
    };

    checkOllama();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/docs" element={<TerminalPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
