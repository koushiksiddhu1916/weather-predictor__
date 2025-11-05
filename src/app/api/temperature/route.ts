import { NextRequest, NextResponse } from 'next/server';

interface TemperatureRequest {
  location: string;
  days?: number;
}

interface TemperaturePrediction {
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TemperatureRequest = await request.json();
    const { location, days = 7 } = body;

    if (!location || location.trim() === '') {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Simulate temperature predictions (in production, use a real weather API)
    const predictions: TemperaturePrediction[] = [];
    const baseTemp = Math.floor(Math.random() * 20) + 15; // Random base temp between 15-35°C
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Generate realistic temperature variations
      const variation = Math.sin(i * 0.5) * 5 + (Math.random() - 0.5) * 3;
      const temp = Math.round((baseTemp + variation) * 10) / 10;
      const tempMin = Math.round((temp - 2 - Math.random() * 2) * 10) / 10;
      const tempMax = Math.round((temp + 2 + Math.random() * 2) * 10) / 10;
      const humidity = Math.floor(Math.random() * 40) + 40; // 40-80%
      
      const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'];
      const description = conditions[Math.floor(Math.random() * conditions.length)];

      predictions.push({
        date: date.toISOString().split('T')[0],
        temp,
        tempMin,
        tempMax,
        humidity,
        description,
      });
    }

    return NextResponse.json({
      location,
      predictions,
      unit: 'celsius',
    });
  } catch (error) {
    console.error('Temperature API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch temperature predictions' },
      { status: 500 }
    );
  }
}
