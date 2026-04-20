import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matches } from '@/lib/db/schema';
import { eq, inArray, and, not } from 'drizzle-orm';
import { syncFixtureByApiId } from '@/lib/actions/sync';
import { scoreMatchPredictions } from '@/lib/actions/scoring';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Get live matches (API-sourced and in progress)
    // Common live statuses: 1H, HT, 2H, ET, P, BT
    const liveStatuses = ['1H', 'HT', '2H', 'ET', 'P', 'BT'];
    
    const liveMatches = await db.select()
      .from(matches)
      .where(and(
        inArray(matches.status, liveStatuses),
        eq(matches.isManual, false)
      ));

    if (liveMatches.length === 0) {
      return NextResponse.json({ message: 'No live API matches to sync' });
    }

    const results = [];
    for (const match of liveMatches) {
      if (match.apiId) {
        const syncResult = await syncFixtureByApiId(match.apiId);
        
        // If the match just finished, score it
        if (syncResult.success) {
           // Refetch to see updated status
           const updatedMatch = await db.select().from(matches).where(eq(matches.id, match.id)).limit(1);
           if (updatedMatch[0].status === 'FT') {
             await scoreMatchPredictions(match.id);
             results.push({ id: match.id, status: 'FT', scored: true });
           } else {
             results.push({ id: match.id, status: updatedMatch[0].status, scored: false });
           }
        }
      }
    }

    return NextResponse.json({ 
      message: `Synced ${results.length} live matches`,
      details: results 
    });
  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
