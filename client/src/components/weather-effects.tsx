import { useWeatherContext } from "@/hooks/use-weather-provider";
import ParticleSystem from "./particle-system";

export default function WeatherEffects() {
  const { weather } = useWeatherContext();

  if (!weather) {
    return null;
  }

  const { condition, is_day } = weather;
  const weatherCondition = condition.text.toLowerCase();

  if (weatherCondition.includes("rain")) {
    return <ParticleSystem type="rain" />;
  }

  if (weatherCondition.includes("snow")) {
    return <ParticleSystem type="snow" />;
  }

  if (weatherCondition.includes("cloud") || weatherCondition.includes("overcast")) {
    return <ParticleSystem type="clouds" />;
  }

  if (!is_day) {
    return <ParticleSystem type="stars" />;
  }

  return null;
}
