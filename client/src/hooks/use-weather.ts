import { useQuery } from "@tanstack/react-query";

interface WeatherData {
  temperature: number;
  weathercode: number;
  is_day: number;
}

const fetchWeather = async (latitude: number, longitude: number): Promise<WeatherData> => {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  const data = await response.json();
  return data.current_weather;
};

export const useWeather = (latitude: number, longitude: number) => {
  return useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: () => fetchWeather(latitude, longitude),
    enabled: !!latitude && !!longitude,
  });
};
