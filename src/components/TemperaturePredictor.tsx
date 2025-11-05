"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { CloudRain, Droplets, Sun, Thermometer, MapPin, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSession } from '@/lib/auth-client';

interface TemperaturePrediction {
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  description: string;
}

interface PredictionResponse {
  location: string;
  predictions: TemperaturePrediction[];
  unit: string;
}

export default function TemperaturePredictor() {
  const { data: session } = useSession();
  const [location, setLocation] = useState('');
  const [days, setDays] = useState('7');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);

  const saveToHistory = async (location: string, days: number) => {
    if (!session?.user) return;

    try {
      const token = localStorage.getItem("bearer_token");
      await fetch('/api/search-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ location, days }),
      });
    } catch (err) {
      console.error('Failed to save search history:', err);
    }
  };

  const handlePredict = async () => {
    if (!location.trim()) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/temperature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.trim(),
          days: parseInt(days) || 7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch predictions');
      }

      const data: PredictionResponse = await response.json();
      setPredictions(data);
      
      // Save to history if user is logged in
      await saveToHistory(location.trim(), parseInt(days) || 7);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    if (!predictions) return [];
    return predictions.predictions.map((pred) => ({
      date: new Date(pred.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Temperature: pred.temp,
      Min: pred.tempMin,
      Max: pred.tempMax,
      Humidity: pred.humidity,
    }));
  };

  return (
    <div className="w-full space-y-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Thermometer className="h-6 w-6" />
            Temperature Predictor
          </CardTitle>
          <CardDescription>
            Get temperature predictions for any location around the world
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="Enter city name (e.g., London, New York)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Number of Days
              </Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handlePredict} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Fetching Predictions...
              </>
            ) : (
              <>
                <Sun className="mr-2 h-4 w-4" />
                Get Temperature Predictions
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {predictions && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {predictions.location}
              </CardTitle>
              <CardDescription>
                {predictions.predictions.length}-day temperature forecast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatChartData()}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      label={{ value: '°C', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="Temperature" 
                      stroke="hsl(var(--chart-1))" 
                      fillOpacity={1}
                      fill="url(#colorTemp)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Min" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Max" 
                      stroke="hsl(var(--chart-5))" 
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {predictions.predictions.map((pred, index) => (
              <Card 
                key={pred.date}
                className="border transition-all hover:shadow-lg hover:border-primary/50"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {new Date(pred.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <CloudRain className="h-3 w-3" />
                    {pred.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-chart-1" />
                      <span className="text-sm font-medium">Temp</span>
                    </div>
                    <span className="text-2xl font-bold">{pred.temp}°C</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Min: {pred.tempMin}°C</span>
                    <span>Max: {pred.tempMax}°C</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 text-chart-2" />
                      <span className="text-muted-foreground">Humidity</span>
                    </div>
                    <span className="font-medium">{pred.humidity}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}