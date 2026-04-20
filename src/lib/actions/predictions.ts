'use server';

import { db } from '@/lib/db';
import { predictions, participants, pools, matches } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function submitPrediction(formData: FormData) {
  const poolId = formData.get('poolId') as string;
  const matchId = formData.get('matchId') as string;
  const participantName = formData.get('participantName') as string;
  const predictedHome = parseInt(formData.get('predictedHome') as string, 10);
  const predictedAway = parseInt(formData.get('predictedAway') as string, 10);

  if (!poolId || !matchId || !participantName || isNaN(predictedHome) || isNaN(predictedAway)) {
    throw new Error('Missing or invalid fields');
  }

  // 1. Ensure the match hasn't started yet. (Status NS = Not Started)
  const matchInfo = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
  if (!matchInfo.length) {
    throw new Error('Match not found');
  }
  if (matchInfo[0].status !== 'NS') {
    throw new Error('Match has already started. Predictions are closed.');
  }

  // 2. Find or create participant
  let participantInfo = await db.select()
    .from(participants)
    .where(and(
      eq(participants.poolId, poolId),
      eq(participants.name, participantName)
    )).limit(1);

  let participantId = '';

  if (participantInfo.length === 0) {
    participantId = crypto.randomUUID();
    await db.insert(participants).values({
      id: participantId,
      poolId: poolId,
      name: participantName,
    });
  } else {
    participantId = participantInfo[0].id;
  }

  // 3. Check for existing prediction
  const existingPrediction = await db.select()
    .from(predictions)
    .where(and(
      eq(predictions.participantId, participantId),
      eq(predictions.matchId, matchId),
      eq(predictions.poolId, poolId)
    )).limit(1);

  if (existingPrediction.length > 0) {
     // Update
     await db.update(predictions)
      .set({
        predictedHome,
        predictedAway,
        updatedAt: new Date()
      })
      .where(eq(predictions.id, existingPrediction[0].id));
  } else {
    // Insert
    await db.insert(predictions).values({
      id: crypto.randomUUID(),
      participantId,
      matchId,
      poolId,
      predictedHome,
      predictedAway,
    });
  }

  revalidatePath(`/p/${poolId}`);
  return { success: true };
}
