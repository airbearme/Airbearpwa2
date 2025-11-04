import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { WeatherProvider } from "@/hooks/use-weather-provider";
import { ThemeProvider } from "next-themes";

// Pages
import Test from "@/pages/test";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange={false}
      >
        <AuthProvider>
          <WeatherProvider>
            <TooltipProvider>
              <Toaster />
              <Test />
            </TooltipProvider>
          </WeatherProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
