export async function fetchFootballApi(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`https://v3.football.api-sports.io/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
      'x-rapidapi-host': 'v3.football.api-sports.io',
    },
    next: { revalidate: 300 } // Cache API responses for 5 minutes by default if used in server components
  });

  if (!response.ok) {
    throw new Error(`API-Football Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
     console.error("API-Football API Error Payload:", data.errors);
     throw new Error(`API-Football API Error: ${JSON.stringify(data.errors)}`);
  }
  return data.response;
}
