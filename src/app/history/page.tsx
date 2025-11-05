"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, History as HistoryIcon, Loader2, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SearchHistoryItem {
  id: number;
  userId: string;
  location: string;
  days: number;
  searchedAt: string;
}

export default function HistoryPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/history");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchHistory();
    }
  }, [session]);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/search-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || (!session?.user && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Search History
          </h1>
          <p className="text-lg text-muted-foreground">
            View your past weather forecast searches
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : history.length === 0 ? (
          <Card className="border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HistoryIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No search history yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Start searching for weather forecasts to build your history
              </p>
              <Button onClick={() => router.push("/")}>
                <Search className="mr-2 h-4 w-4" />
                Search Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((item, index) => (
              <Card
                key={item.id}
                className="border transition-all hover:shadow-lg hover:border-primary/50"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    {item.location}
                  </CardTitle>
                  <CardDescription>
                    {new Date(item.searchedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{item.days} day forecast</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
