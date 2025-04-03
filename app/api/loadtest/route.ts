import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { url, method, duration, concurrent } = await req.json();
  
  // Validate input
  if (!url || !method || !duration || !concurrent) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Initialize results array
  const results: any[] = [];
  const startTime = Date.now();
  
  // Create concurrent requests
  const requests = Array(concurrent).fill(null).map(async () => {
    while (Date.now() - startTime < duration * 1000) {
      const requestStart = Date.now();
      try {
        const response = await fetch(url, { method });
        results.push({
          timestamp: new Date().toISOString(),
          status: response.status,
          responseTime: Date.now() - requestStart,
        });
      } catch (error) {
        results.push({
          timestamp: new Date().toISOString(),
          status: 500,
          responseTime: Date.now() - requestStart,
          error: (error as Error).message,
        });
      }
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  // Wait for all requests to complete
  await Promise.all(requests);

  return NextResponse.json({ results });
}