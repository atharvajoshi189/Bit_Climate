// src/app/api/pollution-stations/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.AQICN_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'AQICN API key not found.' },
      { status: 500 }
    );
  }

  // Geographical bounds for India
  const latLngBounds = '6.74,68.03,35.50,97.39';
  const url = `https://api.waqi.info/map/bounds/?latlng=${latLngBounds}&token=${apiKey}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache data for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      throw new Error(`API returned an error: ${data.message}`);
    }

    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: `Failed to fetch pollution stations: ${error.message}` },
      { status: 500 }
    );
  }
}