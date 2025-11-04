import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '@/hooks/use-auth';
import { WeatherProvider } from '@/hooks/use-weather-provider';
import { Router } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './header';

const queryClient = new QueryClient();

test('renders header', () => {
  render(
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <WeatherProvider>
            <Header />
          </WeatherProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
  const linkElement = screen.getByText(/AirBear/i);
  expect(linkElement).toBeInTheDocument();
});
