"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Activity, Clock, Server } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [duration, setDuration] = useState("10");
  const [concurrent, setConcurrent] = useState("10");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const startTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/loadtest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          method,
          duration: parseInt(duration),
          concurrent: parseInt(concurrent),
        }),
      });
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Load test failed:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">API Load Testing Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Configure your load test parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Target URL</Label>
              <Input
                id="url"
                placeholder="https://api.example.com/endpoint"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Test Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="concurrent">Concurrent Users</Label>
              <Input
                id="concurrent"
                type="number"
                value={concurrent}
                onChange={(e) => setConcurrent(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full mt-4" 
              onClick={startTest}
              disabled={isLoading}
            >
              {isLoading ? "Running Test..." : "Start Load Test"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Real-time performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Requests</p>
                  <p className="text-2xl font-bold">{results.length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Response</p>
                  <p className="text-2xl font-bold">
                    {results.length > 0
                      ? `${(
                          results.reduce((acc, r) => acc + r.responseTime, 0) /
                          results.length
                        ).toFixed(2)}ms`
                      : "0ms"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {results.length > 0
                      ? `${(
                          (results.filter((r) => r.status < 400).length /
                            results.length) *
                          100
                        ).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>

            {results.length > 0 && (
              <div className="w-full h-[300px] mt-4">
                <LineChart
                  width={500}
                  height={300}
                  data={results}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#8884d8"
                    name="Response Time (ms)"
                  />
                </LineChart>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}