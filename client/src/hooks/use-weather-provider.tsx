import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWeather } from "./use-weather";

interface WeatherData {
  temperature: number;
  weathercode: number;
  is_day: number;
}

interface WeatherContextType {
  weather: WeatherData | null;
  isLoading: boolean;
}

const WeatherContext = createContext<WeatherContextType>({
  weather: null,
  isLoading: true,
});

export const useWeatherContext = () => useContext(WeatherContext);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    }
  }, []);

  const { data: weather, isLoading } = useWeather(latitude!, longitude!);

  return (
    <WeatherContext.Provider value={{ weather: weather || null, isLoading }}>
      {children}
    </WeatherContext.Provider>
  );
};
