// src/data/mockData.ts
export interface Hotspot {
  id: string;
  lat: number;
  lon: number;
  title: string;
  description: string;
  data: { label: string; value: string; color: string }[];
}

export const hotspots: Hotspot[] = [
  {
    id: 'delhi_aqi',
    lat: 28.6139,
    lon: 77.2090,
    title: 'Air Quality Alert: New Delhi',
    description: 'Persistent high levels of PM2.5 particles detected, posing significant health risks.',
    data: [
      { label: 'AQI', value: '342', color: 'text-red-400' },
      { label: 'PM2.5', value: '292 µg/m³', color: 'text-red-400' },
      { label: 'AI Prediction', value: 'Worsening', color: 'text-yellow-400' },
    ],
  },
  {
    id: 'amazon_deforestation',
    lat: -3.4653,
    lon: -62.2159,
    title: 'Deforestation Hotspot: Amazon',
    description: 'AI has detected an accelerated rate of deforestation in this region over the past 72 hours.',
    data: [
      { label: 'Area Lost (24h)', value: '15 sq km', color: 'text-red-400' },
      { label: 'Canopy Density', value: '72%', color: 'text-yellow-400' },
      { label: 'Primary Cause', value: 'Illegal Logging', color: 'text-orange-400' },
    ],
  },
  {
    id: 'arctic_ice_melt',
    lat: 80.499,
    lon: 15.492,
    title: 'Ice Melt Anomaly: Arctic Ocean',
    description: 'Sea ice concentration is at a record low for this time of year, impacting global sea levels.',
    data: [
      { label: 'Ice Concentration', value: '65%', color: 'text-blue-400' },
      { label: 'Melt Rate', value: '1.2% per day', color: 'text-red-400' },
      { label: 'Sea Temp.', value: '+2.1°C Anomaly', color: 'text-orange-400' },
    ],
  },
];