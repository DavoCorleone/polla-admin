'use server';

import { db } from '@/lib/db';
import { predictions, participants, matches } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function calculatePoints(
  predictedHome: number, 
  predictedAway: number, 
  actualHome: number, 
  actualAway: number
): Promise<number> {
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 3;
  }
  
  const predictedDifference = predictedHome - predictedAway;
  const actualDifference = actualHome - actualAway;
  
  // Both predict home win, away win, or draw
  if (
    (predictedDifference > 0 && actualDifference > 0) ||
    (predictedDifference < 0 && actualDifference < 0) ||
    (predictedDifference === 0 && actualDifference === 0)
  ) {
    return 1;
  }
  
  return 0;
}

export async function scoreMatchPredictions(matchId: string) {
   const match = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
   if (!match.length || match[0].status !== 'FT' || match[0].homeScore === null || match[0].awayScore === null) {
      return { success: false, message: 'Match is not finished or lacks score' };
   }

   const { homeScore, awayScore } = match[0];

   const unscoredPredictions = await db.select()
    .from(predictions)
    .where(and(
      eq(predictions.matchId, matchId),
      eq(predictions.isScored, false)
    ));

   for (const prediction of unscoredPredictions) {
      const points = await calculatePoints(
        prediction.predictedHome,
        prediction.predictedAway,
        homeScore,
        awayScore
      );

      // Update Prediction
      await db.update(predictions)
        .set({ pointsEarned: points, isScored: true })
        .where(eq(predictions.id, prediction.id));

      // Update Participant's Total Points
      if (points > 0) {
        const participantInfo = await db.select()
          .from(participants)
          .where(eq(participants.id, prediction.participantId))
          .limit(1);
          
        if (participantInfo.length) {
           await db.update(participants)
             .set({ totalPoints: participantInfo[0].totalPoints + points })
             .where(eq(participants.id, prediction.participantId));
        }
      }
   }
   
   return { success: true, count: unscoredPredictions.length };
}

