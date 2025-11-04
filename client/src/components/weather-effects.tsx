import { useWeatherContext } from "@/hooks/use-weather-provider";
import ParticleSystem from "./particle-system";

const getWeatherCondition = (weatherCode: number) => {
  if (weatherCode >= 200 && weatherCode < 300) return "rain";
  if (weatherCode >= 300 && weatherCode < 400) return "rain";
  if (weatherCode >= 500 && weatherCode < 600) return "rain";
  if (weatherCode >= 600 && weatherCode < 700) return "snow";
  if (weatherCode >= 700 && weatherCode < 800) return "clouds";
  if (weatherCode === 800) return "clear";
  if (weatherCode > 800) return "clouds";
  return "clear";
};

export default function WeatherEffects() {
  const { weather } = useWeatherContext();

  if (!weather) {
    return null;
  }

  const { weathercode, is_day } = weather;
  const weatherCondition = getWeatherCondition(weathercode);

  if (weatherCondition === "rain") {
    return <ParticleSystem type="rain" />;
  }

  if (weatherCondition === "snow") {
    return <ParticleSystem type="snow" />;
  }

  if (weatherCondition === "clouds") {
    return <ParticleSystem type="clouds" />;
  }

  if (!is_day) {
    return <ParticleSystem type="stars" />;
  }

  return null;
}
