// src/components/WeatherForecast.tsx

"use client";

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Thermometer } from 'lucide-react';

// Define types for our cleaned weather data
interface CurrentWeather {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon: string;
}
interface Forecast {
    time: number;
    temp?: number; // Hourly
    temp_max?: number; // Daily
    temp_min?: number; // Daily
    icon: string;
    description?: string; // Daily
}
interface WeatherData {
    current: CurrentWeather;
    hourly: Forecast[];
    daily: Forecast[];
}

// Helper to format time
const formatTime = (timestamp: number) => new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
const getDayOfWeek = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'short' });

export default function WeatherForecast() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationName, setLocationName] = useState('Nagpur, India');

    useEffect(() => {
        const fetchWeather = (lat: number, lon: number) => {
            setLoading(true);
            setError(null);
            fetch(`http://127.0.0.1:8000/air/weather_forecast?lat=${lat}&lon=${lon}`)
                .then(res => {
                    if (!res.ok) throw new Error("Failed to fetch weather data.");
                    return res.json();
                })
                .then(data => {
                    setWeather(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        };

        // Try to get user's location from browser
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationName("Your Location");
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                () => { // If user denies permission, use default (Nagpur)
                    setError("Location access denied. Showing weather for default location.");
                    fetchWeather(21.1458, 79.0882);
                }
            );
        } else { // If browser doesn't support geolocation
            fetchWeather(21.1458, 79.0882);
        }
    }, []);

    if (loading) {
        return <div className="text-white text-center p-8 bg-[#161B22]/70 rounded-lg">Loading weather forecast...</div>;
    }

    if (error && !weather) {
        return <div className="text-red-400 text-center p-8 bg-[#161B22]/70 rounded-lg">{error}</div>;
    }
    
    if (!weather) return null;

    return (
        <div className="bg-[#161B22]/80 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/30 text-white w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-1">Weather Forecast</h2>
            <p className="text-gray-400 mb-6">{locationName}</p>

            {/* Current Weather */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-8">
                <div className="flex items-center gap-4">
                    <img src={`https://openweathermap.org/img/wn/${weather.current.icon}@4x.png`} alt="weather icon" className="w-28 h-28" />
                    <div>
                        <p className="text-6xl font-bold">{Math.round(weather.current.temp)}°C</p>
                        <p className="text-gray-300">{weather.current.description}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2"><Thermometer size={16} className="text-gray-400" /> Feels like: <strong>{Math.round(weather.current.feels_like)}°C</strong></div>
                    <div className="flex items-center gap-2"><Wind size={16} className="text-gray-400" /> Wind: <strong>{weather.current.wind_speed} m/s</strong></div>
                    <div className="flex items-center gap-2"><Droplets size={16} className="text-gray-400" /> Humidity: <strong>{weather.current.humidity}%</strong></div>
                </div>
            </div>
            
            {/* Hourly Forecast */}
            <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Hourly Forecast</h3>
                <div className="flex overflow-x-auto gap-4 pb-4">
                    {weather.hourly.map((hour, index) => (
                        <div key={index} className="flex-shrink-0 text-center bg-gray-800/50 p-3 rounded-lg w-24">
                            <p className="text-sm text-gray-400">{formatTime(hour.time)}</p>
                            <img src={`https://openweathermap.org/img/wn/${hour.icon}@2x.png`} alt="icon" className="w-12 h-12 mx-auto" />
                            <p className="font-bold text-lg">{Math.round(hour.temp!)}°C</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7-Day Forecast */}
            <div>
                <h3 className="text-xl font-bold mb-4">7-Day Forecast</h3>
                <div className="space-y-2">
                    {weather.daily.map((day, index) => (
                         <div key={index} className="grid grid-cols-3 items-center text-center bg-gray-800/50 p-2 rounded-lg">
                            <p className="font-semibold text-left">{getDayOfWeek(day.time)}</p>
                            <img src={`https://openweathermap.org/img/wn/${day.icon}.png`} alt="icon" className="w-8 h-8 mx-auto" />
                            <p className="text-gray-300 font-medium">
                                <span className="text-white font-bold">{Math.round(day.temp_max!)}°</span> / {Math.round(day.temp_min!)}°
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}