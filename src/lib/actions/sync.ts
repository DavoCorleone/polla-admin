'use server';

import { fetchFootballApi } from '@/lib/api-football/client';
import { db } from '@/lib/db';
import { matches, teams } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import crypto from 'crypto';

export async function syncFixtureByApiId(apiFixtureId: number) {
  const data = await fetchFootballApi('fixtures', { id: apiFixtureId.toString() });
  if (!data || data.length === 0) {
    throw new Error(`Fixture ${apiFixtureId} not found`);
  }

  const fixture = data[0];
  
  // 1. Sync Teams
  await syncTeamFromApi(fixture.teams.home);
  await syncTeamFromApi(fixture.teams.away);

  // Get local team IDs
  const localHomeTeam = await db.select().from(teams).where(eq(teams.apiId, fixture.teams.home.id)).limit(1);
  const localAwayTeam = await db.select().from(teams).where(eq(teams.apiId, fixture.teams.away.id)).limit(1);

  if (!localHomeTeam.length || !localAwayTeam.length) {
     throw new Error("Failed to resolve local teams after sync.");
  }

  // 2. Sync Match
  const existingMatch = await db.select().from(matches).where(eq(matches.apiId, apiFixtureId)).limit(1);
  
  const status = fixture.fixture.status.short;

  if (existingMatch.length > 0) {
    await db.update(matches).set({
      status: status,
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
      homeScoreHt: fixture.score.halftime.home,
      awayScoreHt: fixture.score.halftime.away,
      matchDate: new Date(fixture.fixture.date),
      syncedAt: new Date()
    }).where(eq(matches.id, existingMatch[0].id));
    return { success: true, updated: true, matchId: existingMatch[0].id };
  } else {
    const matchId = crypto.randomUUID();
    await db.insert(matches).values({
      id: matchId,
      apiId: apiFixtureId,
      leagueId: fixture.league.id,
      homeTeamId: localHomeTeam[0].id,
      awayTeamId: localAwayTeam[0].id,
      matchDate: new Date(fixture.fixture.date),
      status: status,
      homeScore: fixture.goals.home,
      awayScore: fixture.goals.away,
      homeScoreHt: fixture.score.halftime.home,
      awayScoreHt: fixture.score.halftime.away,
      venue: fixture.fixture.venue.name,
      round: fixture.league.round,
      season: fixture.league.season,
    });
    return { success: true, updated: false, matchId };
  }
}

async function syncTeamFromApi(apiTeam: any) {
  const existingTeam = await db.select().from(teams).where(eq(teams.apiId, apiTeam.id)).limit(1);
  if (existingTeam.length === 0) {
    await db.insert(teams).values({
      id: crypto.randomUUID(),
      apiId: apiTeam.id,
      name: apiTeam.name,
      logoUrl: apiTeam.logo,
    });
  }
}
