'use server';

import { db } from '@/lib/db';
import { pools, poolMatches } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function createPool(name: string, ownerId: string, logoUrl?: string) {
  if (!name || !ownerId) {
    throw new Error('Name and Owner ID are required');
  }

  const poolId = crypto.randomUUID();

  await db.insert(pools).values({
    id: poolId,
    name,
    ownerId,
    logoUrl: logoUrl || null,
  });

  revalidatePath('/admin');
  return { poolId };
}

export async function updatePool(poolId: string, name: string, logoUrl?: string) {
  if (!poolId || !name) {
    throw new Error('Pool ID and Name are required');
  }

  await db.update(pools)
    .set({
      name,
      logoUrl: logoUrl || null,
    })
    .where(eq(pools.id, poolId));

  revalidatePath('/admin');
  revalidatePath(`/p/${poolId}/admin`);
  return { success: true };
}

export async function assignMatchToPool(poolId: string, matchId: string) {
  try {
     await db.insert(poolMatches).values({ poolId, matchId });
     revalidatePath(`/p/${poolId}/admin`);
     return { success: true };
  } catch (error) {
     console.error("Error assigning match to pool", error);
     throw new Error("Failed to assign match. Maybe it's already assigned?");
  }
}

export async function removeMatchFromPool(poolId: string, matchId: string) {
  await db.delete(poolMatches).where(and(
    eq(poolMatches.poolId, poolId),
    eq(poolMatches.matchId, matchId)
  ));
  revalidatePath(`/p/${poolId}/admin`);
  return { success: true };
}
